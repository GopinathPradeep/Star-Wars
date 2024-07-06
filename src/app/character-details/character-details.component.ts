import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../_services/data.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-character-details',
  templateUrl: './character-details.component.html',
  styleUrls: ['./character-details.component.scss'],
})
export class CharacterDetailsComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  character: any;
  moviesData: any = [];
  vehicleData: any = [];
  starShipData: any = [];
  selectedFilm: any;
  selectedvehicle: any;
  selectedstar: any;
  error: any = '';
  constructor(private router: Router, private dataservice: DataService) {
    let wholeData = JSON.parse(localStorage.getItem('char'));
    let data = JSON.parse(localStorage.getItem('navigatedCharacter'));
    let matched = wholeData.filter((r) => r.name == data.name);
    this.character = matched[0];
    console.log(this.character, 'this.character');
  }

  ngOnInit(): void {
    this.getdata();
  }

  getdata() {
    if (this.character.films.length) {
      const subscription = this.dataservice.getAllCharacters(this.character.films).subscribe(
        (res: any) => {
          res.map((character: any) => {
            this.moviesData.push({
              episode: character.episode_id,
              title: character.title,
              director: character.director,
              producer: character.producer,
              release_date: moment(character.release_date).format('DD-MM-YYYY'),
            });
          });
          this.selectedFilm = this.moviesData[0];
        },
        (error) => {
          console.error('Error in fetching API:', error);
          this.error = 'API Call failed, Please re-load the page';
        }
      );
      this.subscriptions.push(subscription)
    } else {
      this.moviesData = [];
    }

    if (this.character.vehicles.length) {
      const subscription = this.dataservice.getAllCharacters(this.character.vehicles).subscribe(
        (res: any) => {
          res.map((character: any) => {
            this.vehicleData.push({
              name: character.name,
              model: character.model,
              manufacturer: character.manufacturer,
              passengers: character.passengers,
              cargo_capacity: character.cargo_capacity,
            });
          });
          this.selectedvehicle = this.vehicleData[0];
        },
        (error) => {
          console.error('Error in fetching API:', error);
          this.error = 'API Call failed, Please re-load the page';
        }
      );
      this.subscriptions.push(subscription)
    } else {
      this.vehicleData = [];
    }

    if (this.character.starships.length) {
      const subscription = this.dataservice.getAllCharacters(this.character.starships).subscribe(
        (res: any) => {
          console.log(res, 'response');
          res.map((character: any) => {
            this.starShipData.push({
              name: character.name,
              model: character.model,
              manufacturer: character.manufacturer,
              passengers: character.passengers,
              cargo_capacity: character.cargo_capacity,
            });
          });
          this.selectedstar = this.starShipData[0];
        },
        (error) => {
          console.error('Error in fetching API:', error);
          this.error = 'API Call failed, Please re-load the page';
        }
      );
      this.subscriptions.push(subscription)

    } else {
      this.starShipData = [];
    }
  }

  navigate() {
    this.router.navigate(['/dashboard']);
  }

  selectedship(val: any) {
    this.selectedstar = val;
  }

  selectFilm(val: any) {
    console.log(val, 'value');
    this.selectedFilm = val;
  }

  selectvehicle(val: any) {
    this.selectedvehicle = val;
  }

  format(val) {
    if (val == 'unknown') {
      return '-';
    } else {
      return val;
    }
  }
}
