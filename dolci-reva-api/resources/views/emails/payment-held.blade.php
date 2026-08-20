@extends('emails.layouts.dolci')

@section('title', 'Paiement sécurisé — Dolci Rêva')
@section('preheader', 'Un paiement a été reçu et sécurisé pour votre réservation.')
@section('eyebrow', 'Paiement')
@section('heading', 'Paiement reçu & sécurisé')

@section('greeting')
    Bonjour {{ $user->first_name }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        Le client a réglé la réservation. Le montant est sécurisé par Dolci Rêva et sera versé sur votre wallet à l&apos;arrivée (validation par QR code).
    </p>
@endsection

@section('details')
    @include('emails.partials.detail-rows', ['rows' => $detailRows])
@endsection

@section('note')
    Les fonds restent protégés jusqu&apos;à la validation du séjour ou du service.
@endsection

@section('action_url', $actionUrl)
@section('action_label', 'Voir la réservation')
