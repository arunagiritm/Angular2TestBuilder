
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router }   from '@angular/router';
import 'rxjs/add/operator/pluck';

import { Hero }              from '../model';
import { HeroDetailService } from './hero-detail.service';

@Component({
  moduleId: module.id,
  selector:    'app-hero-detail',
  templateUrl: 'hero-detail.component.html',
  styleUrls:  ['hero-detail.component.css','abc' ],
  providers:  [ HeroDetailService ]
})
export class HeroDetailComponent implements OnInit {
  constructor(
    private heroDetailService: HeroDetailService,
    private route:  ActivatedRoute,
    private router: Router) {
  }

  @Input() hero: Hero;
  
  ngOnInit(): void {
   
    this.route.params.pluck<string>('id')
      .forEach(id => this.getHero(id))
      .catch(() => this.hero = new Hero());
  }

  private getHero(id: string): void {
    this.heroDetailService.getHero(id).then(hero => {
      if (hero) {
        this.hero = hero;
      } else {
        this.gotoList();
      }
    });
  }

  save(name:string,phone:number): string {
    this.heroDetailService.saveHero(this.hero).then(() => this.gotoList());
    return "";
  }

  cancel() { this.gotoList(); }

  gotoList() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}


