import { User } from './../interfaces/user';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import FirebaseErrorHandler from '../lib/firebase-error-handler.service';
import { ToastService } from './toast.service';
import { NavegacaoService } from './navegacao.service';


@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  private userID: any;

  constructor(
    private auth: AngularFireAuth,
    private fireStore: AngularFirestore,
    private storageService: StorageService,
    private toastService: ToastService,
    private navCtrl: NavController,
    private navService: NavegacaoService
  ) {}

  public async loginWithEmail(email: string, senha: string): Promise<any> {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(
        email,
        senha
      );
      const uid = userCredential?.user?.uid;
      this.getDetails(uid).subscribe((query) => {
        let usuario = query.data();
        this.storageService.saveStorage(usuario as User);
      });
      this.userID = uid;
      this.navCtrl.navigateForward('home');
    } catch (erro) {
      this.toastService.showToast(FirebaseErrorHandler(erro));
      console.log(erro);
      //return null;
    }
  }

  public async signUp(data: User, senha: string): Promise<any> {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(
        data.email,
        senha
      );
      const uid = userCredential?.user?.uid;

      this.saveDetails({
        ...data,
        uid: uid,
      });

      this.navService.navegarPara('home');
    } catch (error) {
      this.toastService.showToast(error as string);
      console.log(error);
    }
  }

  public saveDetails(data: any) {
    return this.fireStore.collection('users').doc(data.uid).set(data);
  }

  public getUserID() {
    return this.userID;
  }

  public getDetails(uid: any) {
    return this.fireStore.collection('users').doc(uid).get();
  }

  public async deleteUser(uid: string): Promise<void> {
    try {
      await this.fireStore.collection('users').doc(uid).delete();
    } catch (error) {
      console.log(error);
    }
  }

  public async deleteCampo(user: User,campo: string): Promise<void> {
    const campoObj = {[campo]: null};
    //const updateObject: { [key: string]: any } = {};
    //updateObject[campo] = firebase.firestore.FieldValue.delete();
    try {
      await this.fireStore.collection('users').doc(user.uid).update(campoObj);
    } catch (error) {
      console.log(error);
    }
  }

  public async updateUser(user: User,campo: string,dado: any): Promise<void> {
    try {
      await this.fireStore.collection('users').doc(user.uid).update({
        [campo]: dado,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
