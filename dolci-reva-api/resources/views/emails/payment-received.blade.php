@extends('emails.layouts.dolci')

@section('title', 'Paiement crédité — Dolci Rêva')
@section('preheader', 'Les fonds ont été crédités sur votre wallet.')
@section('eyebrow', 'Wallet')
@section('heading', 'Fonds crédités')

@section('greeting')
    Bonjour {{ $user->first_name }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        Le paiement de la réservation a été confirmé et crédité sur votre wallet. Merci de votre confiance.
    </p>
@endsection

@section('details')
    @include('emails.partials.detail-rows', ['rows' => $detailRows])
@endsection

@section('action_url', $actionUrl)
@section('action_label', 'Voir mon wallet')
