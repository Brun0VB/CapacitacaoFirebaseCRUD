import { ToastService } from './../../services/toast.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/interfaces/user';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, ToastController } from '@ionic/angular';
import { alertController } from '@ionic/core';
import { BuscaCEPService } from 'src/app/services/busca-cep.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  userVetor: User[] = [];
  segmentChange: String = 'visualizar';
  documentData: any[] = [];
  cepsExtendidos: any[] = [];

  constructor(
    private cepService: BuscaCEPService,
    private fireStore: AngularFirestore,
    private alertCtrl: AlertController,
    private auth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private toast: ToastService
  ) {
    this.getUserData();
    //this.guardaCepExtendido();
  }

  private async getUserData(): Promise<void> {
    //primeira maneira de chamar todos os documentos de uma coleção
    const collectionRef = this.fireStore.collection('users');

    let userBanco = await collectionRef.get().toPromise();

    let users = userBanco?.docs.map((doc) => {
      return doc.data();
    });

    console.log(users);

    //segunda maneira de chamar todos os documentos de uma coleção
    collectionRef.valueChanges().subscribe((data) => {
      this.userVetor = data as User[];
      //this.setExpandedFalse();
      console.log(this.userVetor);
    });


  }

  async deleteUser(user: User): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Atenção',
      message: 'Deseja realmente excluir o usuário?',
      buttons: [
        {
          text: 'Sim',
          handler: async () => {
            try {
              await this.firebaseService.deleteUser(user.uid);
              this.toast.showToast('Usuário excluído com sucesso!');
            } catch (error) {
              this.toast.showToast('Erro ao excluir usuário!');
            }
          },
        },
        {
          text: 'Não',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  async updateCampo(user: User, campo: string) {
    const alert = await this.alertCtrl.create({
      //header: 'Please enter your info',    
      inputs: [
        {
          placeholder: campo,
          name: 'dadoInput',
        },
      ],
      buttons: [
        {
          text: 'OK',
          handler: async (dados) => {
            if (dados.dadoInput != '') {
              try {
                await this.firebaseService.updateUser(user.uid, campo, dados.dadoInput);
                this.toast.showToast('Usuário atualizado com sucesso!');
              } catch (error) {
                this.toast.showToast('Erro ao atualizar usuário!');
              }
            } else {
              this.toast.showToast('Campo vazio!');
              this.updateCampo(user, campo);
            }
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        }
      ],
    });

    await alert.present();
  }

  async createCampo(user: User) {
    const alert = await this.alertCtrl.create({
      //header: 'Please enter your info',    
      inputs: [
        {
          placeholder: 'campo',
          name: 'campoInput',
        },
        {
          placeholder: 'dado',
          name: 'dadoInput',
        }
      ],
      buttons: [
        {
          text: 'OK',
          handler: async (dados) => {
            if (dados.campoInput != '' && dados.dadoInput != '') {
              try {
                await this.firebaseService.updateUser(user.uid, dados.campoInput, dados.dadoInput);
                this.toast.showToast('Usuário atualizado com sucesso!');
              } catch (error) {
                this.toast.showToast('Erro ao atualizar usuário!');
              }
            }
            else {
              this.toast.showToast('Campo vazio!');
              this.createCampo(user);
            }
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
        }
      ],
    });

    await alert.present();
  }


  setExpandedFalse() {
    this.userVetor.forEach(item => {
      item.isExpanded = false;
    });
  }

  expand(i: number) {
    this.userVetor[i].isExpanded = !this.userVetor[i].isExpanded;
  }

  deleteCampo(user: User, campo: string) {
    this.firebaseService.deleteCampo(user, campo);
    user.isExpanded = true;
  }

 async verificaCep(cep: any){
    const enderecoColocado = await this.cepService.consultaCEP(cep);
    let mensagem = '';
    if (enderecoColocado.gia == '') {
      mensagem = enderecoColocado.logradouro + ', ' + enderecoColocado.bairro + ', ' + enderecoColocado.localidade + ' - ' + enderecoColocado.uf;
      console.log(mensagem);
    }else{
      mensagem = enderecoColocado.gia;
    }  
    console.log(enderecoColocado);
    const alert = await this.alertCtrl.create({
      header: 'Endereço',
      subHeader: cep,
      message:mensagem, 
      buttons: [
        {
          text: 'OK',
        },
      ],
    });

    await alert.present();
  }

  // async guardaCepExtendido(){
  //   await this.getUserData();
  //   console.log(this.userVetor.length);
  //   for(let i = 0; i < this.userVetor.length; i++){
  //      this.cepsExtendidos.push(await this.verificaCep(this.userVetor[i].cep));
  //   }
  //   console.log(this.cepsExtendidos);
  //}

}
