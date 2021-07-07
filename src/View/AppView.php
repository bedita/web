<?php
/**
 * BEdita, API-first content management framework
 * Copyright 2018 ChannelWeb Srl, Chialab Srl
 *
 * This file is part of BEdita: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * See LICENSE.LGPL or <http://gnu.org/licenses/lgpl-3.0.html> for more details.
 */
namespace App\View;

use BEdita\WebTools\View\TwigView;
use Cake\Core\Configure;
use Cake\Utility\Hash;

/**
 * Application View default class
 *
 */
class AppView extends TwigView
{

    /**
     * {@inheritDoc}
     */
    public function initialize(): void
    {
        parent::initialize();

        $this->loadHelper('Flash');
        $this->loadHelper('Form', [
            'templates' => [
                'hiddenBlock' => '{{content}}',
                'submitContainer' => '{{content}}',
                'inputContainer' => '<div class="input {{type}}{{required}} {{containerClass}}">{{content}}</div>',
                'richtext' => '<div name="{{name}}" contenteditable{{attrs}}>{{value}}</div>',
            ],
        ]);
        $this->Form->addWidget('richtext', ['Richtextarea']);
        $this->loadHelper('Layout');
        $this->loadHelper('Array');
        $this->loadHelper('Html');
        $this->loadHelper('Link');
        $this->loadHelper('Property');
        $this->loadHelper('Time', ['outputTimezone' => Configure::read('I18n.timezone', 'UTC')]);
        $this->loadHelper('Perms');
        $this->loadHelper('Schema');
        $this->loadHelper('Text');
        $this->loadHelper('BEdita/WebTools.Thumb');
        $this->loadHelper('Url');
        $this->loadHelper('BEdita/I18n.I18n');
    }

    /**
     * {@inheritDoc}
     *
     * Retrieve custom view `element` from configuration mappings.
     *
     * If `Elements.{module_name}.{element_name}` exists in configuration a custom element is loaded
     */
    protected function _getElementFileName($name, $pluginCheck = true)
    {
        $module = (array)$this->get('currentModule', []);
        $custom = Configure::read(sprintf('Elements.%s', Hash::get($module, 'name', '')));
        if (!empty($custom[$name])) {
            $name = $custom[$name];
        }

        return parent::_getElementFileName($name, $pluginCheck);
    }
}
