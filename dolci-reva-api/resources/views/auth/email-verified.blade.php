<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Vérifié - Dolci Rêva</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(160deg, #f4efe8 0%, #fffdfb 42%, #fff5eb 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            position: relative;
            overflow-x: hidden;
        }

        .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(64px);
            pointer-events: none;
            z-index: 0;
        }

        .bg-orb-1 {
            width: 380px;
            height: 380px;
            top: -120px;
            right: -80px;
            background: rgba(240, 132, 0, 0.18);
            animation: pulse 4s ease-in-out infinite;
        }

        .bg-orb-2 {
            width: 340px;
            height: 340px;
            bottom: -100px;
            left: -60px;
            background: rgba(255, 107, 53, 0.14);
            animation: pulse 5s ease-in-out infinite 1s;
        }

        .bg-orb-3 {
            width: 280px;
            height: 280px;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(240, 132, 0, 0.08);
            animation: pulse 6s ease-in-out infinite 0.5s;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
        }

        .wrapper {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 420px;
            animation: slideUp 0.55s ease-out;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .brand {
            text-align: center;
            margin-bottom: 28px;
        }

        .brand a {
            display: inline-block;
            text-decoration: none;
        }

        .brand img {
            width: 168px;
            max-width: 70%;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .brand h1 {
            display: none;
        }

        .brand p {
            margin-top: 12px;
            font-size: 12px;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: #8a7f72;
        }

        .card {
            position: relative;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 20px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(240, 132, 0, 0.06);
            overflow: hidden;
        }

        .card::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(240, 132, 0, 0.15), transparent 40%, rgba(255, 107, 53, 0.12));
            z-index: 0;
            pointer-events: none;
        }

        .card-inner {
            position: relative;
            z-index: 1;
            padding: 36px 28px 28px;
            text-align: center;
        }

        .success-icon,
        .error-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.45s ease-out 0.2s both;
        }

        .success-icon {
            background: linear-gradient(135deg, #f08400, #ff6b35);
            box-shadow: 0 10px 28px rgba(240, 132, 0, 0.35);
        }

        .error-icon {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            box-shadow: 0 10px 28px rgba(239, 68, 68, 0.3);
        }

        @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .success-icon svg,
        .error-icon svg {
            width: 32px;
            height: 32px;
            stroke: #ffffff;
            stroke-width: 2.5;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .card-inner h2 {
            font-size: 22px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }

        .card-inner .subtitle {
            font-size: 15px;
            font-weight: 600;
            background: linear-gradient(90deg, #f08400, #ff6b35);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 14px;
        }

        .card-inner p {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .login-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 14px 24px;
            background: linear-gradient(90deg, #f08400, #f97316, #ff6b35);
            color: #ffffff;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.25s ease;
            box-shadow: 0 8px 24px rgba(240, 132, 0, 0.35);
            border: none;
            cursor: pointer;
        }

        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(240, 132, 0, 0.45);
        }

        .login-button.error {
            background: linear-gradient(90deg, #ef4444, #dc2626);
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        }

        .info-box {
            margin-top: 22px;
            padding: 14px 16px;
            background: linear-gradient(135deg, rgba(240, 132, 0, 0.06), rgba(255, 107, 53, 0.05));
            border: 1px solid rgba(240, 132, 0, 0.18);
            border-left: 3px solid #f08400;
            border-radius: 10px;
            text-align: left;
        }

        .info-box.error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(220, 38, 38, 0.04));
            border-color: rgba(239, 68, 68, 0.2);
            border-left-color: #ef4444;
        }

        .info-box p {
            margin: 0;
            font-size: 13px;
            color: #4b5563;
            line-height: 1.5;
        }

        .footer {
            margin-top: 24px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.6;
        }

        .footer strong {
            color: #6b7280;
            font-weight: 700;
        }

        @media (max-width: 480px) {
            .card-inner {
                padding: 28px 20px 22px;
            }

            .brand h1 {
                font-size: 22px;
            }

            .card-inner h2 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>
    <div class="bg-orb bg-orb-3"></div>

    <div class="wrapper">
        <div class="brand">
            <a href="{{ rtrim(config('app.frontend_url'), '/') }}">
                <img
                    src="{{ rtrim(config('app.url'), '/') }}/images/brand/logo-custom.png"
                    alt="Dolci Rêva"
                    width="168"
                >
            </a>
            <p>Kiffer l&apos;instant</p>
        </div>

        <div class="card">
            <div class="card-inner">
                @if($success ?? false)
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="subtitle">Email vérifié</div>
                    <h2>Félicitations !</h2>
                    <p>{{ $message ?? 'Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter à votre compte.' }}</p>

                    <a href="{{ rtrim(config('app.frontend_url'), '/') }}/auth/sign-in" class="login-button">
                        Se connecter
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>

                    <div class="info-box">
                        <p>
                            <strong>Prochaine étape :</strong> connectez-vous pour découvrir et réserver les meilleurs lieux de Côte d&apos;Ivoire.
                        </p>
                    </div>
                @else
                    <div class="error-icon">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div class="subtitle" style="background: linear-gradient(90deg, #ef4444, #dc2626); -webkit-background-clip: text; background-clip: text;">
                        Vérification échouée
                    </div>
                    <h2>Oops !</h2>
                    <p style="color: #dc2626;">{{ $message ?? 'Une erreur est survenue lors de la vérification de votre email.' }}</p>

                    <a href="{{ rtrim(config('app.frontend_url'), '/') }}/auth/sign-in" class="login-button error">
                        Retour à la connexion
                    </a>

                    <div class="info-box error">
                        <p>
                            <strong>Que faire ?</strong> Demandez un nouvel email de vérification depuis l&apos;application, ou contactez le support si le problème persiste.
                        </p>
                    </div>
                @endif
            </div>
        </div>

        <div class="footer">
            <p><strong>Dolci Rêva</strong></p>
            <p>Votre plateforme de réservation</p>
            <p style="margin-top: 8px;">© {{ date('Y') }} Dolci Rêva. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
