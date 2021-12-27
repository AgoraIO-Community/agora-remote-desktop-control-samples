import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RDCRoleType } from 'agora-rdc-core';
import { lastValueFrom } from 'rxjs';
import { ControlledOptions, HostOptions } from 'src/app/interfaces';
import { APIService, Session } from '../../service/api/api.service';
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
  get RDCRoleType() {
    return RDCRoleType
  }

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

    this.enginesService.ignite(this.session, this.options);
    this.profilesService.subscribe(this.userId, this.options);
  }
}
