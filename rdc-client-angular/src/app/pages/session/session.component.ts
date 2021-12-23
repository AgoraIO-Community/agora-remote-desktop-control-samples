import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ControlledOptions, HostOptions } from 'src/app/interfaces';
import { APIService, Profile, Session } from '../../service/api/api.service';
import { EnginesService } from '../../service/engines/engines.service';
import { ParametersService } from '../../service/parameters/parameters.service';
import { ProfilesService } from '../../service/profile/profiles.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.css'],
})
export class SessionComponent implements OnInit {
  userId?: string;
  session?: Session;
  options?: HostOptions | ControlledOptions;
  profiles: Profile[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private parametersService: ParametersService,
    private apiService: APIService,
    private profilesService: ProfilesService,
    private enginesService: EnginesService,
  ) {}

  ngOnInit(): void {
    this.initialize();
  }

  private async initialize() {
    this.userId = await this.parametersService.getUserId(this.activatedRoute);
    this.options = await this.parametersService.getOptions(this.activatedRoute);
    this.session = await lastValueFrom(this.apiService.fetchSession(this.userId));

    this.profilesService.subscribe(this.userId, this.options);
    this.enginesService.ignite(this.session, this.options);
    this.profilesService.profiles.subscribe((profiles: Profile[]) => {
      this.profiles = profiles;
    });
  }
}
