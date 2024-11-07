<?php

/*
 * Copyright (c) 2024. Esup - Université de Bordeaux.
 *
 * This file is part of the Esup-Oasis project (https://github.com/EsupPortail/esup-oasis).
 *  For full copyright and license information please view the LICENSE file distributed with the source code.
 *
 *  @author Manuel Rossard <manuel.rossard@u-bordeaux.fr>
 *
 */

namespace App\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\QueryBuilder;

class UtilisateurRoleFilter extends AbstractFilter
{

    public const string PROPERTY = 'role';

    protected function filterProperty(string                      $property, $value, QueryBuilder $queryBuilder,
                                      QueryNameGeneratorInterface $queryNameGenerator, string $resourceClass,
                                      ?Operation                  $operation = null, array $context = []): void
    {
        if ($property !== self::PROPERTY) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $roleParam = $queryNameGenerator->generateParameterName('role');

        $queryBuilder->andWhere(sprintf('JSON_CONTAINS(%s.roles, :%s) = true', $rootAlias, $roleParam))
            ->setParameter($roleParam, $value);

        return;

    }

    public function getDescription(string $resourceClass): array
    {
        return [];
    }
}