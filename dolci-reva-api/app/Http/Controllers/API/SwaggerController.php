<?php

namespace App\Http\Controllers\API;

use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     title="Dolcireva API",
 *     version="2.0.0",
 *     description="API de réservation et gestion d'établissements (Hôtels, Résidences, Restaurants, Lounges, Night Clubs)",
 *     @OA\Contact(
 *         email="support@dolcireva.com",
 *         name="Support Dolcireva"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Serveur de développement"
 * )
 * 
 * @OA\Server(
 *     url="https://dolci-reva.com/api",
 *     description="Serveur de production"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Authentification par token Bearer"
 * )
 * 
 * @OA\Tag(
 *     name="Authentication",
 *     description="Endpoints d'authentification"
 * )
 * 
 * @OA\Tag(
 *     name="Public",
 *     description="Endpoints publics (sans authentification)"
 * )
 * 
 * @OA\Tag(
 *     name="Hotels",
 *     description="Gestion des hôtels et chambres"
 * )
 * 
 * @OA\Tag(
 *     name="Residences",
 *     description="Gestion des résidences"
 * )
 * 
 * @OA\Tag(
 *     name="Restaurants",
 *     description="Gestion des restaurants et tables"
 * )
 * 
 * @OA\Tag(
 *     name="Lounges",
 *     description="Gestion des lounges et tables"
 * )
 * 
 * @OA\Tag(
 *     name="Night Clubs",
 *     description="Gestion des night clubs et zones"
 * )
 * 
 * @OA\Tag(
 *     name="Bookings",
 *     description="Gestion des réservations"
 * )
 * 
 * @OA\Tag(
 *     name="Media",
 *     description="Gestion des médias et images"
 * )
 * 
 * @OA\Tag(
 *     name="Feature Categories",
 *     description="Catalogue de catégories et options de caractéristiques (paramétrable depuis l'admin)"
 * )
 * @OA\Tag(
 *     name="Feature Options",
 *     description="Options sélectionnables au sein d'une catégorie de caractéristiques"
 * )
 * 
 * @OA\Tag(
 *     name="Finance",
 *     description="Gestion financière (wallets, transactions, retraits)"
 * )
 */
class SwaggerController
{
    //
}
