import { Component, OnInit } from '@angular/core';

import { SharedService } from '../../../Shared/shared.service';
import { LoaderService } from '../../../Shared/loader.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class LoginComponent implements OnInit {
  password: any;
  email: any;
  constructor(public service: SharedService, private router: Router,private toastr: ToastrService,public loader:LoaderService) {}
  ngOnInit(): void {}
  login() {
    this.loader.show()
    var obj = {
      email: this.email,
      password: this.password,
    };
    this.service.loginpost(obj).subscribe((res:any)=>{
      console.log(res);
      if (res.message == 'Logged in successfully') {
        this.router.navigateByUrl('/dashboard/home');
   this.toastr.success("LoggedIn Successfully")
      }
    });
        this.loader.hide()
  }
}
