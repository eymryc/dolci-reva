@extends('emails.layouts.dolci')

@section('title', 'Réservation annulée — Dolci Rêva')
@section('preheader', 'Une réservation a été annulée.')
@section('eyebrow', 'Annulation')
@section('heading', 'Réservation annulée')

@section('greeting')
    Bonjour {{ $user->first_name }},
@endsection

@section('content')
    <p style="margin:0 0 14px;">
        La réservation <strong style="color:#12100c;">{{ $booking->booking_reference }}</strong> a été annulée.
        @if (!empty($reason))
            Vous trouverez le motif ci-dessous.
        @endif
    </p>
@endsection

@section('details')
    @include('emails.partials.detail-rows', ['rows' => $detailRows])
@endsection

@section('note')
@if (!empty($reason))
    Motif&nbsp;: {{ $reason }}
@endif
@endsection

@section('action_url', $actionUrl)
@section('action_label', 'Voir les détails')
