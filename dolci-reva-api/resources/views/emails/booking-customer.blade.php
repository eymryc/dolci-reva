@extends('emails.layouts.dolci')

@section('title', 'Votre réservation — Dolci Rêva')
@section('preheader', 'Votre demande de réservation a bien été enregistrée.')
@section('eyebrow', 'Réservation')
@section('heading', 'Demande bien reçue')

@section('greeting')
    Bonjour {{ $user->first_name }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        Votre demande a été enregistrée avec soin. L&apos;établissement la confirmera sous peu — vous serez prévenu dès que ce sera fait.
    </p>
@endsection

@section('details')
    @include('emails.partials.detail-rows', ['rows' => $detailRows])
@endsection

@section('note')
    Statut actuel&nbsp;: <strong>en attente de confirmation</strong> par l&apos;établissement.
@endsection

@section('action_url', $actionUrl)
@section('action_label', 'Voir ma réservation')
