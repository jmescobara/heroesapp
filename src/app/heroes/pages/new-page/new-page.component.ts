import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/hero.service';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit{

// Formulario reactivo
  public heroForm = new FormGroup({
    id:        new FormControl<string>(''),
    superhero: new FormControl<string>('', {nonNullable:true}), // siempre sera un string, nunca puede estar nulo
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl<string>(''),
    first_appearance: new FormControl<string>(''),
    characters: new FormControl<string>(''),
    alt_img: new FormControl<string>(''),
  });


  public publishers =[
    {id : 'DC Comics', desc: 'DC - Comics'},
    {id : 'Marvel Comics', desc: 'Marvel - Comics'},
  ];

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    ){}

  get currentHero():Hero {
    const hero = this.heroForm.value as Hero;
    return hero;

  }

  ngOnInit(): void {
    if( !this.router.url.includes('edit') ) return;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroById(id)),
      ).subscribe(hero =>{
          if ( !hero ) {
            return this.router.navigateByUrl('/');
        }

          this.heroForm.reset( hero );
          return;
      });
  }

  onSubmit():void{

    if( this.heroForm.invalid ) return;

    if( this.currentHero.id){
      this.heroesService.updateHero(this.currentHero)
        .subscribe(hero => {
          this.showSnackbar(`${ hero.superhero } updated!`);
        });

      return;
    }

    this.heroesService.addHero(this.currentHero)
      .subscribe(hero =>{
        //mostrar snackbar, y a /hero/edit/hero.id
        this.router.navigate([ '/hero/edit', hero.id ]);
        this.showSnackbar(`${ hero.superhero } created!`);
      });

    // console.log({
    //   formIsValid: this.heroForm.valid,
    //   value: this.heroForm.value,
    // });
  }

  onDeleteHero(){
    if ( !this.currentHero.id ) return;

    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed()
    .pipe(
      filter((result:boolean) => result), // dejo pasar solo al true de confirmdialogcomponen.ts
      switchMap( () => this.heroesService.deleteHeroById( this.currentHero.id)), //trae una respuesta de confirmacion
      filter( (wasDeleted: boolean) => wasDeleted ), // evalua la respuestra true o false del servicio(true)
    )
    .subscribe( () => {
      this.router.navigate(['/heroes']);
    });

    // dialogRef.afterClosed().subscribe( result => {
    //   if ( !result ) return;

    //   this.heroesService.deleteHeroById( this.currentHero.id )
    //     .subscribe( wasDeleted => {
    //       if(wasDeleted)
    //       this.router.navigate(['/heroes'])
    //     });
    //   // console.log('deleted')
    // });
  }

  showSnackbar(message: string):void{
    this.snackbar.open(message, 'done', {
      duration: 2500,
    })
  }

}
