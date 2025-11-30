import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // Guard này sẽ tự động kích hoạt 'local' strategy (LocalStrategy) và chạy hàm validate() của nó.
}
