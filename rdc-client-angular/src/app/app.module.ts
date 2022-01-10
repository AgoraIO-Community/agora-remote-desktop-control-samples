import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingComponent } from './pages/landing/landing.component';
import { SessionComponent } from './pages/session/session.component';
import { ServiceModule } from './service/service.module';
import { ProfilesComponent } from './pages/session/profiles/profiles.component';
import { HostComponent } from './pages/session/host/host.component';
import { ControllerComponent } from './pages/session/controller/controller.component';
import { ControlledComponent } from './pages/session/controlled/controlled.component';
import { ObserverComponent } from './pages/session/observer/observer.component';

registerLocaleData(en);
@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    SessionComponent,
    ProfilesComponent,
    HostComponent,
    ControllerComponent,
    ControlledComponent,
    ObserverComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzGridModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzAffixModule,
    NzIconModule,
    NzModalModule,
    NzInputNumberModule,
    NzDrawerModule,
    NzListModule,
    NzMessageModule,
    NzTabsModule,
    NzSpinModule,
    NzTagModule,
    ServiceModule,
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
