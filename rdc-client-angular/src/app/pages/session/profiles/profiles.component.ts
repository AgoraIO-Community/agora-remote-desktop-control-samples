import { Component, ContentChild, OnInit, TemplateRef } from '@angular/core';
import { Profile } from '../../../service/api/api.service';
import { ProfilesService } from '../../../service/profile/profiles.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css'],
})
export class ProfilesComponent implements OnInit {
  visible = true;
  profiles: Profile[] = [];

  @ContentChild('action')
  actionTemplate!: TemplateRef<any>;

  constructor(private profilesService: ProfilesService) {}

  ngOnInit(): void {
    this.profilesService.profiles.subscribe((profiles: Profile[]) => {
      this.profiles = profiles;
    });
  }

  toggleVisible() {
    this.visible = !this.visible;
  }
}
