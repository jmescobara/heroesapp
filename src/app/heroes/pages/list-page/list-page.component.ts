import { Component, OnInit } from '@angular/core';
import { HeroesService } from '../../services/hero.service';
import { Hero } from '../../interfaces/hero.interface';

@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styles: [
  ]
})
export class ListPageComponent implements OnInit {

  public heroes: Hero[] = [];

  constructor( private heroesService: HeroesService){}


  ngOnInit(): void {
    //para que se dispare aca tenemos el suscribe()
    this.heroesService.getHeroes()
      .subscribe( heroes => this.heroes = heroes );
  }

}
