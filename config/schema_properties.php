<?php
return [
    /**
     * Default properties schema for internal resources.
     * Schema properties are described using JSON Schema.
     *
     */
    'SchemaProperties' => [

        // model/object_types
        'object_types' => [
            'id' => [
                'type' => 'integer',
                '$id' => '/properties/id',
                'title' => 'Id',
                'description' => '',
                'readOnly' => true,
            ],
            'name' => [
                'type' => 'string',
                '$id' => '/properties/name',
                'title' => 'Name',
                'description' => 'model unique name',
                'maxLength' => 32,
            ],
            'singular' => [
                'type' => 'string',
                '$id' => '/properties/singular',
                'title' => 'Singular name',
                'description' => 'Model unique singular name',
                'maxLength' => 32,
            ],
            'description' => [
                'oneOf' => [
                    [
                        'type' => 'null',
                    ],
                    [
                        'type' => 'string',
                        'contentMediaType' => 'text/html',
                    ],
                ],
                '$id' => '/properties/description',
                'title' => 'Description',
                'description' => 'object type description',
            ],
            'is_abstract' => [
                'type' => 'boolean',
                '$id' => '/properties/is_abstract',
                'title' => 'Is Abstract',
                'description' => '',
                'default' => false,
            ],
            'enabled' => [
                'type' => 'boolean',
                '$id' => '/properties/enabled',
                'title' => 'Enabled',
                'description' => '',
                'default' => true,
            ],
            'core_type' => [
                'type' => 'boolean',
                '$id' => '/properties/core_type',
                'title' => 'Core type',
                'description' => '',
                'default' => true,
            ],
            'associations' => [
                'oneOf' => [
                    [
                        'type' => 'null',
                    ],
                    [
                        'type' => 'object',
                    ],
                ],
                '$id' => '/properties/associations',
                'title' => 'Associations',
                'description' => 'Object type entity associations',
            ],
            'hidden' => [
                'oneOf' => [
                    [
                        'type' => 'null',
                    ],
                    [
                        'type' => 'object',
                    ],
                ],
                '$id' => '/properties/hidden',
                'title' => 'Hidden',
                'description' => 'Object type entity associations',
            ],
        ],

        // model/property_types
        'property_types' => [
            'id' => [
                'type' => 'integer',
                '$id' => '/properties/id',
                'title' => 'Id',
                'description' => '',
                'readOnly' => true,
            ],
            'name' => [
                'type' => 'string',
                '$id' => '/properties/name',
                'title' => 'Name',
                'description' => 'property unique name',
                'maxLength' => 32,
            ],
            'params' => [
                'oneOf' => [
                    [
                        'type' => 'null',
                    ],
                    [
                        'type' => 'object',
                    ],
                ],
                '$id' => '/properties/hidden',
                'title' => 'Params',
                'description' => 'Property params, JSON Schema format',
            ],
        ],

        // model/relations
        'relations' => [
            'id' => [
                'type' => 'integer',
                '$id' => '/properties/id',
                'title' => 'Id',
                'description' => '',
                'readOnly' => true,
            ],
            'label' => [
                'type' => 'string',
                '$id' => '/properties/label',
                'title' => 'Label',
                'description' => 'Relation label',
            ],
            'inverse_name' => [
                'type' => 'string',
                '$id' => '/properties/inverse_name',
                'title' => 'Inverse name',
                'description' => 'Relation unique inverse name',
                'maxLength' => 32,
            ],
            'inverse_label' => [
                'type' => 'string',
                '$id' => '/properties/inverse_label',
                'title' => 'Inverse Label',
                'description' => 'Relation inverse label',
            ],
            'name' => [
                'type' => 'string',
                '$id' => '/properties/name',
                'title' => 'Name',
                'description' => 'Relation unique name',
                'maxLength' => 32,
            ],
            'description' => [
                'oneOf' => [
                    [
                        'type' => 'null',
                    ],
                    [
                        'type' => 'string',
                        'contentMediaType' => 'text/html',
                    ],
                ],
                '$id' => '/properties/description',
                'title' => 'Description',
                'description' => 'Relation description',
            ],
            'params' => [
                'oneOf' => [
                    [
                        'type' => 'null',
                    ],
                    [
                        'type' => 'object',
                    ],
                ],
                '$id' => '/properties/hidden',
                'title' => 'Params',
                'description' => 'Property params, JSON Schema format',
            ],
        ],

        // model/categories
        'categories' => [
            'id' => [
                'type' => 'integer',
                '$id' => '/properties/id',
                'title' => 'Id',
                'description' => '',
                'readOnly' => true,
            ],
            'name' => [
                'type' => 'string',
                '$id' => '/properties/name',
                'title' => 'Name',
                'description' => 'Category name',
            ],
            'label' => [
                'type' => 'string',
                '$id' => '/properties/label',
                'title' => 'Label',
                'description' => 'Category label',
            ],
            'enabled' => [
                'type' => 'boolean',
                '$id' => '/properties/enabled',
                'title' => 'Enabled',
                'description' => '',
                'default' => true,
            ],
            'type' => [
                'type' => 'string',
                '$id' => '/properties/enabled',
                'title' => 'Type',
                'description' => '',
                'enum' => [],
            ],
        ],
    ],
];
