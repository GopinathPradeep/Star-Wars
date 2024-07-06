import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from './app.component';
import { HttpClientModule } from "@angular/common/http";
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Ng2SearchPipeModule } from "ng2-search-filter";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { CharacterDetailsComponent } from './character-details/character-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CharacterDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    Ng2SearchPipeModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
