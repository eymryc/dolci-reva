@extends('emails.layouts.dolci')

@section('title', 'Nouvelle réservation — Dolci Rêva')
@section('preheader', 'Vous avez reçu une nouvelle demande de réservation.')
@section('eyebrow', 'Établissement')
@section('heading', 'Nouvelle demande reçue')

@section('greeting')
    Bonjour {{ $user->first_name }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        Une nouvelle réservation vient d&apos;arriver sur votre établissement. Prenez un moment pour la consulter et répondre à votre client.
    </p>
@endsection

@section('details')
    @include('emails.partials.detail-rows', ['rows' => $detailRows])
@endsection

@section('action_url', $actionUrl)
@section('action_label', 'Voir la réservation')
