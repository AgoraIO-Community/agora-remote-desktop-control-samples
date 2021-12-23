import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { APIService } from './api/api.service';
import { EnginesService } from './engines/engines.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { ParametersService } from './parameters/parameters.service';
import { ProfilesService } from './profile/profiles.service';

@NgModule({
  declarations: [],
  imports: [HttpClientModule],
  exports: [LocalStorageService, APIService, EnginesService, ParametersService, ProfilesService],
})
export class ServiceModule {}
