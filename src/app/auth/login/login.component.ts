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
  adminid: any;
  constructor(
    public service: SharedService,
    private router: Router,
    private toastr: ToastrService,
    public loader: LoaderService,
  ) {}
  ngOnInit(): void {}
  login() {
    this.loader.show();

    const obj = {
      email: this.email,
      password: this.password,
    };

    this.service.loginpost(obj).subscribe({
      next: (res: any) => {
        console.log(res);

        if (res?.message === 'Logged in successfully') {
          this.adminid = res.admin.branchId;
          localStorage.setItem('admin', this.adminid);

          this.toastr.success(res.message);

          this.router.navigateByUrl('/dashboard/home');
        } else {
          this.toastr.error('Unexpected response from server');
        }

        this.loader.hide();
      },

      error: (err) => {
        console.error('Login error:', err);

        const errorMessage =
          err?.error?.message || err?.message || 'Login failed';

        this.toastr.error(errorMessage);

        this.loader.hide();
      },
    });
  }
}
