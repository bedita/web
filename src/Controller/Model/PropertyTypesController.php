<?php
/**
 * BEdita, API-first content management framework
 * Copyright 2019 ChannelWeb Srl, Chialab Srl
 *
 * This file is part of BEdita: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE.LGPL or <http://gnu.org/licenses/lgpl-3.0.html> for more details.
 */
namespace App\Controller\Model;

use BEdita\SDK\BEditaClientException;
use Cake\Http\Exception\BadRequestException;
use Cake\Http\Response;
use Psr\Log\LogLevel;

/**
 * Property Types Model Controller: list, add, edit, remove property types
 *
 */
class PropertyTypesController extends ModelBaseController
{
    /**
     * Resource type currently used
     *
     * @var string
     */
    protected $resourceType = 'property_types';

    /**
     * {@inheritDoc}
     *
     * @codeCoverageIgnore
     */
    public function initialize(): void
    {
        parent::initialize();
        $this->Security->setConfig('unlockedActions', ['save']);
    }

    /**
     * Save property types (includes: add/edit/delete)
     *
     * @return null
     */
    public function save(): ?Response
    {
        $payload = $this->request->getData();

        $this->request->allowMethod(['post']);
        $response = [];

        try {
            if (empty($payload)) {
                throw new BadRequestException('empty request');
            }
            $response['saved'] = [];
            $response['edited'] = [];
            $response['removed'] = [];

            if (!empty($payload['addPropertyTypes'])) {
                $response['saved'] = $this->addPropertyTypes($payload['addPropertyTypes']);
            }

            if (!empty($payload['editPropertyTypes'])) {
                $response['edited'] = $this->editPropertyTypes($payload['editPropertyTypes']);
            }

            if (!empty($payload['removePropertyTypes'])) {
                $response['removed'] = $this->removePropertyTypes($payload['removePropertyTypes']);
            }
        } catch (BEditaClientException $error) {
            $this->log($error, LogLevel::ERROR);

            $this->set([
                'error' => $error->getMessage(),
                '_serialize' => ['error'],
            ]);

            return null;
        }

        $this->set((array)$response);
        $this->set('_serialize', true);

        return null;
    }

    /**
     * Add property types
     *
     * @param array $addPropertyTypes Property types
     * @return array
     */
    protected function addPropertyTypes(array $addPropertyTypes): array
    {
        $result = [];
        foreach ($addPropertyTypes as $addPropertyType) {
            if (isset($addPropertyType['params'])) {
                $params = json_decode($addPropertyType['params'], true);
                $addPropertyType['params'] = $params;
            }

            $body = [
                'data' => [
                    'type' => $this->resourceType,
                    'attributes' => $addPropertyType,
                ],
            ];

            $resp = $this->apiClient->post(sprintf('/model/%s', $this->resourceType), json_encode($body));
            unset($resp['data']['relationships']);

            $result[] = $resp['data'];
        }

        return $result;
    }

    /**
     * Edit property types
     *
     * @param array $editPropertyTypes Property types
     * @return array
     */
    protected function editPropertyTypes(array $editPropertyTypes): array
    {
        $result = [];
        foreach ($editPropertyTypes as $editPropertyType) {
            $id = (string)$editPropertyType['id'];
            $type = $this->resourceType;
            $body = [
                'data' => [
                    'id' => $id,
                    'type' => $type,
                    'attributes' => $editPropertyType['attributes'],
                ],
            ];
            $resp = $this->apiClient->patch(sprintf('/model/%s/%s', $type, $id), json_encode($body));
            unset($resp['data']['relationships']);

            $result[] = $resp['data'];
        }

        return $result;
    }

    /**
     * Remove property types
     *
     * @param array $removePropertyTypes Property types
     * @return array
     */
    protected function removePropertyTypes(array $removePropertyTypes): array
    {
        $result = [];
        foreach ($removePropertyTypes as $removePropertyTypeId) {
            $this->apiClient->delete(sprintf('/model/%s/%s', $this->resourceType, $removePropertyTypeId), null);
            $result[] = $removePropertyTypeId;
        }

        return $result;
    }
}
