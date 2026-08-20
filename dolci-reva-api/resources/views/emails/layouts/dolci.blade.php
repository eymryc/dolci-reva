@php
    $logoUrl = rtrim(config('app.url'), '/') . '/images/brand/logo-custom.png';
    $siteUrl = rtrim(config('app.frontend_url'), '/');
    $brandName = 'Dolci Rêva';
    $supportEmail = 'contact@dolci-reva.com';
@endphp
<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>@yield('title', $brandName)</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; display: block; }
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #f4efe8;
            font-family: Georgia, 'Times New Roman', Times, serif;
            color: #2a241c;
        }
        a { color: #f08400; }
        .preheader {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            color: transparent;
            height: 0;
            width: 0;
            max-height: 0;
            max-width: 0;
            overflow: hidden;
            mso-hide: all;
        }
        @media only screen and (max-width: 620px) {
            .email-shell { width: 100% !important; }
            .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .email-body-pad { padding: 28px 20px !important; }
            .cta-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f4efe8;">
    <div class="preheader">@yield('preheader', '')</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4efe8;">
        <tr>
            <td align="center" style="padding: 36px 16px;">
                <table role="presentation" class="email-shell" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:560px; background-color:#ffffff; border:1px solid #ebe3d8;">
                    {{-- Header brand --}}
                    <tr>
                        <td align="center" style="background-color:#12100c; padding: 28px 24px 24px;">
                            <a href="{{ $siteUrl }}" style="text-decoration:none;">
                                <img
                                    src="{{ $logoUrl }}"
                                    alt="{{ $brandName }}"
                                    width="168"
                                    style="width:168px; max-width:70%; height:auto; margin:0 auto;"
                                >
                            </a>
                            <p style="margin:14px 0 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size:11px; letter-spacing:0.28em; text-transform:uppercase; color:#c9b8a4;">
                                Kiffer l&apos;instant
                            </p>
                        </td>
                    </tr>

                    {{-- Accent line --}}
                    <tr>
                        <td style="height:3px; line-height:3px; font-size:0; background:linear-gradient(90deg, #d87200, #f08400, #ff9a2e); background-color:#f08400;">&nbsp;</td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td class="email-body-pad" style="padding: 36px 40px 28px; background-color:#fffdfb;">
                            @hasSection('eyebrow')
                                <p style="margin:0 0 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:11px; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:#f08400;">
                                    @yield('eyebrow')
                                </p>
                            @endif

                            <h1 style="margin:0 0 18px; font-family: Georgia, 'Times New Roman', Times, serif; font-size:26px; line-height:1.25; font-weight:400; color:#12100c;">
                                @yield('heading')
                            </h1>

                            <p style="margin:0 0 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:15px; line-height:1.65; color:#4a4136;">
                                @yield('greeting')
                            </p>

                            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:15px; line-height:1.65; color:#4a4136;">
                                @yield('content')
                            </div>

                            @hasSection('details')
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 26px 0 8px; background-color:#faf7f2; border:1px solid #ebe3d8;">
                                    <tr>
                                        <td style="padding: 18px 20px;">
                                            @yield('details')
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            @php
                                $noteContent = trim($__env->yieldContent('note'));
                            @endphp
                            @if ($noteContent !== '')
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 6px; background-color:#fff8f0; border-left:3px solid #f08400;">
                                    <tr>
                                        <td style="padding: 14px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; line-height:1.55; color:#5c5348;">
                                            {!! $noteContent !!}
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            @php
                                $actionUrl = trim($__env->yieldContent('action_url'));
                                $actionLabel = trim($__env->yieldContent('action_label')) ?: 'Voir les détails';
                            @endphp
                            @if ($actionUrl !== '')
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0 8px;">
                                    <tr>
                                        <td align="center">
                                            <a
                                                class="cta-btn"
                                                href="{{ $actionUrl }}"
                                                style="display:inline-block; padding:14px 32px; background-color:#f08400; color:#ffffff; text-decoration:none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase;"
                                            >
                                                {{ $actionLabel }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            <p style="margin: 28px 0 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size:15px; line-height:1.5; color:#2a241c;">
                                À bientôt,<br>
                                <span style="color:#f08400;">L&apos;équipe {{ $brandName }}</span>
                            </p>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding: 24px 32px 28px; background-color:#faf7f2; border-top:1px solid #ebe3d8; text-align:center;">
                            <p style="margin:0 0 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#8a7f72;">
                                {{ $brandName }}
                            </p>
                            <p style="margin:0 0 12px; font-family: Georgia, 'Times New Roman', Times, serif; font-size:13px; color:#6e6458;">
                                Votre compagnon pour kiffer l&apos;instant
                            </p>
                            <p style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; line-height:1.6; color:#9a9084;">
                                <a href="{{ $siteUrl }}" style="color:#f08400; text-decoration:none;">{{ parse_url($siteUrl, PHP_URL_HOST) ?: 'dolci-reva.com' }}</a>
                                &nbsp;·&nbsp;
                                <a href="mailto:{{ $supportEmail }}" style="color:#f08400; text-decoration:none;">{{ $supportEmail }}</a>
                                <br>
                                © {{ date('Y') }} {{ $brandName }}. Tous droits réservés.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
