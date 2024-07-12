import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../_services/data.service';
import { Subscription, forkJoin, map, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  characters: any = [];
  moviesData: any = [];
  filteredCharacters: any = [];
  speciesData: any = [];
  vechicleData: any = [];
  starShipsData: any = [];
  displayentries: any = [];
  currentPage: any = 1;
  itemsPerPage = 10;
  isLoading: boolean = false;
  pageSize: any;
  originalresponse: any = [];
  searchText: any;
  settings: any;
  filtered: any = [];
  showTable: boolean = false;
  error: any = '';
  filterForm = new FormGroup({
    movieName: new FormControl('Filter By Movie'),
    species: new FormControl('Filter By Species'),
    birthYear: new FormControl(),
  });
  nextPage: Number = 0;
  totalCharacters: number = 0;
  constructor(private dataservice: DataService, private router: Router) {
    const storedCharacters = sessionStorage.getItem('characters');
    if (storedCharacters) {
      try {
        this.characters = JSON.parse(storedCharacters);
        this.displayentries = this.characters;
      } catch (error) {
        this.characters = [];
        this.displayentries = [];
      }
    } else {
      this.characters = [];
      this.displayentries = [];
    }
    this.nextPage = JSON.parse(sessionStorage.getItem('page'));
    this.totalCharacters = JSON.parse(sessionStorage.getItem('totalcount'));
    this.moviesData = JSON.parse(sessionStorage.getItem('moviesData'));
    this.speciesData = JSON.parse(sessionStorage.getItem('speciesData'));
    this.filteredCharacters = JSON.parse(
      sessionStorage.getItem('filteredCharacters')
    );
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.settings = {
      singleSelection: true,
      idField: 'birth_year',
      textField: 'birth_year',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
    console.log(this.characters, this.nextPage, 'this.characters');

    if (this.characters == null || this.characters?.length == 0) {
      this.getPeopleData(0);
    } else if (this.nextPage != 0) {
      this.isLoading = true;
      this.currentPage = this.nextPage;
      this.originalresponse = this.characters;
    } else {
      this.nextPage = 0;
      this.isLoading = true;
    }
  }

  getPeopleData(page: any) {
    if (page == 0) {
      this.displayentries = [];
      const subscription = this.dataservice.getCharacters('/people').subscribe(
        (data: any) => {
          this.characters = data.results;
          this.totalCharacters = data.count;
          sessionStorage.setItem('totalcount', this.totalCharacters.toString());
          const filmObservables = [];
          this.characters.forEach(
            (val: any) => {
              let speciesId = val.species[0]?.slice(-2, -1)[0];
              if (speciesId !== undefined) {
                this.dataservice.getSpecies(`/species/${speciesId}/`).subscribe(
                  (speciesData: any) => {
                    val.species = speciesData ? speciesData.name : '-';
                  },
                  (error) => {
                    console.error('Error in fetching API:', error);
                    this.error = 'API Call failed, Please re-load the page';
                    this.clear();
                  }
                );
              } else {
                val.species = '-';
              }
              sessionStorage.setItem('char', JSON.stringify(this.characters));
            },
            (error) => {
              console.error('Error in fetching API:', error);
              this.error = 'API Call failed, Please re-load the page';
              this.clear();
            }
          );

          sessionStorage.setItem('characters', JSON.stringify(this.characters));
          this.displayentries = this.characters;
          this.originalresponse = this.characters;
          if (this.moviesData == null || this.moviesData.length == 0) {
            this.getMovieData();
          }
        },
        (error) => {
          console.error('Error in fetching API:', error);
          this.error = 'API Call failed, Please re-load the page';
          this.clear();
        }
      );
      this.subscriptions.push(subscription);
    } else {
      // this.characters = [];
      this.displayentries = [];
      sessionStorage.setItem('page', page.toString());
      const subscription = this.dataservice
        .getCharacters(`/people/?page=${page}`)
        .subscribe(
          (data: any) => {
            this.characters = data.results;
            let pendingRequests = this.characters.length;

            const checkAPICompletion = () => {
              pendingRequests--;
              if (pendingRequests === 0) {
                sessionStorage.setItem('char', JSON.stringify(this.characters));
                sessionStorage.setItem(
                  'characters',
                  JSON.stringify(this.characters)
                );
                this.displayentries = this.characters;
                this.originalresponse = this.characters;
                this.getMovieData();
              }
            };

            this.characters.forEach((val: any) => {
              const speciesId = val.species[0]?.slice(-2, -1)[0];
              if (speciesId !== undefined) {
                this.dataservice.getSpecies(`/species/${speciesId}/`).subscribe(
                  (speciesData: any) => {
                    val.species = speciesData ? speciesData.name : '-';
                    checkAPICompletion();
                  },
                  (error) => {
                    val.species = '-';
                    checkAPICompletion();
                  }
                );
              } else {
                val.species = '-';
                checkAPICompletion();
              }
            });
          },
          (error) => {
            console.error('Error in fetching API:', error);
            this.error = 'API Call failed, Please re-load the page';
            this.clear();
          }
        );

      this.subscriptions.push(subscription);
    }
  }

  getMovieData() {
    const subscription = this.dataservice.getMovies('/films').subscribe(
      (data: any) => {
        let responseData = [];
        responseData = data.results;
        responseData.forEach((e: any) => {
          if (e.episode_id == 4) {
            this.dataservice
              .getAllCharacters(e.characters)
              .subscribe((res: any) => {
                this.moviesData = res.map((character: any) => character.name);
                sessionStorage.setItem(
                  'moviesData',
                  JSON.stringify(this.moviesData)
                );
                this.getSpeciesData();
                this.filterCharacters();
              });
          }
        });
      },
      (error) => {
        console.error('Error fetching movies:', error);
        this.error = 'API call failed. Please reload the page.';
      }
    );

    this.subscriptions.push(subscription);
  }

  filterCharacters() {
    this.filteredCharacters = this.characters.filter(
      (birthYearData: any, index: number, self: any[]) => {
        const birthYear = birthYearData.birth_year;
        if (index === self.findIndex((b: any) => b.birth_year === birthYear)) {
          if (birthYear.endsWith('BBY')) {
            const year = parseFloat(birthYear.replace('BBY', ''));
            return year >= 5 && year <= 30;
          } else if (birthYear.endsWith('ABY')) {
            const year = parseFloat(birthYear.replace('ABY', ''));
            return year <= 5;
          }
        }
        return false;
      }
    );
    sessionStorage.setItem(
      'filteredCharacters',
      JSON.stringify(this.filteredCharacters)
    );
  }

  getSpeciesData() {
    const subscription = this.dataservice.getSpecies(`/species`).subscribe(
      (data: any) => {
        let responseData = [];
        responseData = data.results;
        responseData.forEach((e: any) => {
          if (e.name == 'Human') {
            this.dataservice
              .getAllCharacters(e.people)
              .subscribe((res: any) => {
                this.speciesData = res.map((character: any) => character.name);
                sessionStorage.setItem(
                  'speciesData',
                  JSON.stringify(this.speciesData)
                );
                if (res) {
                  this.isLoading = true;
                }
              });
          }
        });
      },
      (error) => {
        console.error('Error in fetching API:', error);
        this.error = 'API Call failed, Please re-load the page';
        this.clear();
      }
    );
    this.subscriptions.push(subscription);
  }

  navigate(data: any, index: number) {
    sessionStorage.setItem('navigatedCharacter', JSON.stringify(data));
    this.router.navigate(['/characters', index]);
  }

  findbirthyr(yr: any) {
    if (yr == 'unknown') {
      return '-';
    } else {
      return yr;
    }
  }

  onItemDeSelect(event: any) {
    console.log(event);
  }

  onItemSelect(event: any) {
    console.log(event);
  }

  onPageChange(pageNum: number): void {
    this.initForm()
    this.showTable = false;
    this.pageSize = this.itemsPerPage * (pageNum - 1);
    this.getPeopleData(pageNum);
  }

  initForm(){
    this.filterForm = new FormGroup({
      movieName: new FormControl('Filter By Movie'),
      species: new FormControl('Filter By Species'),
      birthYear: new FormControl(),
    }); 
  }

  applyFilters() {
    this.showTable = false;
    const { movieName, species, birthYear } = this.filterForm.value;

    this.filtered = this.characters.filter((character) => {
      return (
        (character.name.includes(movieName) &&
          birthYear.includes(character.birth_year)) ||
        (character.name.includes(movieName) &&
          character.species.includes(species))
      );
    });
    console.log(this.filtered, 'filteredCharacters');
    this.characters = [];
    this.displayentries = [];
    this.displayentries = this.filtered;
    if (this.filtered.length == 0) {
      this.showTable = true;
    } else {
      this.showTable = false;
    }
  }

  clearFilter() {
    this.displayentries = this.originalresponse;
    this.filterForm.reset()
  }

  clear() {
    sessionStorage.clear();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
