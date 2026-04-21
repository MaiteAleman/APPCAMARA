import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  photos: { image: string; date: string; caption: string }[] = [];

  constructor(private alertCtrl: AlertController) {
    this.loadPhotos();
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    const newPhoto = {
      image: image.dataUrl || '',
      date: new Date().toLocaleDateString(),
      caption: 'Por defecto',
    };

    this.photos.push(newPhoto);

    await Preferences.set({
      key: 'photos',
      value: JSON.stringify(this.photos),
    });

    const alert = await this.alertCtrl.create({
      header: 'Foto guardada',
      message: 'Tu foto se ha almacenado correctamente.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async loadPhotos() {
    const stored = await Preferences.get({ key: 'photos' });
    if (stored.value) {
      this.photos = JSON.parse(stored.value);
    }
  }

  async deletePhoto(photo: { image: string; date: string; caption: string }) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar foto',
      message: '¿Seguro que quieres eliminar esta foto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            this.photos = this.photos.filter(p => p !== photo);
            await Preferences.set({
              key: 'photos',
              value: JSON.stringify(this.photos),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async editPhoto(photo: { image: string; date: string; caption: string }) {
    const alert = await this.alertCtrl.create({
      header: 'Editar foto',
      inputs: [
        {
          name: 'caption',
          type: 'text',
          value: photo.caption,
          placeholder: 'Escribe un nuevo título',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            photo.caption = data.caption;
            await Preferences.set({
              key: 'photos',
              value: JSON.stringify(this.photos),
            });
          },
        },
      ],
    });
    await alert.present();
  }
}
