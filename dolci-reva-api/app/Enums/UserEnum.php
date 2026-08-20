<?php

namespace App\Enums;

enum UserEnum: string
{
    case CUSTOMER = 'CUSTOMER';
    case OWNER = 'OWNER';
    case ADMIN = 'ADMIN';
    case SUPER_ADMIN = 'SUPER_ADMIN';
}
