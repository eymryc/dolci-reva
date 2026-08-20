@extends('emails.layouts.dolci')

@section('title', 'Vérifiez votre email — Dolci Rêva')
@section('preheader', 'Activez votre compte Dolci Rêva en quelques secondes.')
@section('eyebrow', 'Bienvenue')
@section('heading', 'Confirmez votre adresse email')

@section('greeting')
    Bonjour {{ $user->first_name }}{{ $user->last_name ? ' '.$user->last_name : '' }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        Merci de rejoindre <strong style="color:#12100c; font-weight:600;">Dolci Rêva</strong>.
        Pour activer votre compte et commencer à explorer les plus beaux lieux, validez votre adresse email.
    </p>
@endsection

@section('note')
    Ce lien est valable <strong>60 minutes</strong>. Si vous n&apos;êtes pas à l&apos;origine de cette inscription, ignorez simplement cet email.
@endsection

@section('action_url', $verificationUrl)
@section('action_label', 'Vérifier mon email')

@section('details')
    <p style="margin:0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; color:#8a7f72;">
        Bouton inactif ? Copiez ce lien dans votre navigateur&nbsp;:
    </p>
    <p style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px; line-height:1.5; word-break:break-all;">
        <a href="{{ $verificationUrl }}" style="color:#f08400; text-decoration:none;">{{ $verificationUrl }}</a>
    </p>
@endsection
