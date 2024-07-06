import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private url = 'https://swapi.dev/api';

  constructor(private http: HttpClient) { }

  getCharacters(params:any): Observable<any> {
    return this.http.get(this.url + params);
  }

  getCharacter(url: string): Observable<any> {
    return this.http.get<any>(url);
  }

  getAllCharacters(urls: string[]): Observable<any[]> {
    const requests = urls.map(url => this.getCharacter(url));
    return forkJoin(requests);
  }

  getSpecies(params:any): Observable<any> {
    return this.http.get(this.url + params);
  }

  getVehicles(params:any): Observable<any> {
    return this.http.get(this.url + params);
  }

  getStarships(params:any): Observable<any> {
    return this.http.get(this.url + params);
  }

  getMovies(params:any): Observable<any> {
    return this.http.get(this.url + params);
  }
}

