@extends('emails.layouts.dolci')

@section('title', 'Réservation confirmée — Dolci Rêva')
@section('preheader', 'Bonne nouvelle : votre réservation est confirmée.')
@section('eyebrow', 'Confirmée')
@section('heading', 'C\'est confirmé')

@section('greeting')
    Bonjour {{ $user->first_name }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        L&apos;établissement a accepté votre réservation. Il ne vous reste plus qu&apos;à profiter de l&apos;instant.
    </p>
@endsection

@section('details')
    @include('emails.partials.detail-rows', ['rows' => $detailRows])
@endsection

@section('action_url', $actionUrl)
@section('action_label', 'Voir ma réservation')
