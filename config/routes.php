<?php
/**
 * Routes configuration
 *
 * In this file, you set up routes to your controllers and their actions.
 * Routes are very important mechanism that allows you to freely connect
 * different URLs to chosen controllers and their actions (functions).
 *
 * CakePHP(tm) : Rapid Development Framework (https://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (https://cakefoundation.org)
 * @link          https://cakephp.org CakePHP(tm) Project
 * @license       https://opensource.org/licenses/mit-license.php MIT License
 */

use Cake\Routing\RouteBuilder;
use Cake\Routing\Router;
use Cake\Routing\Route\DashedRoute;
use Cake\Utility\Inflector;

/**
 * The default class to use for all routes
 *
 * The following route classes are supplied with CakePHP and are appropriate
 * to set as the default:
 *
 * - Route
 * - InflectedRoute
 * - DashedRoute
 *
 * If no call is made to `Router::defaultRouteClass()`, the class used is
 * `Route` (`Cake\Routing\Route\Route`)
 *
 * Note that `Route` does not do any inflections on URLs which will result in
 * inconsistently cased URLs when used with `:plugin`, `:controller` and
 * `:action` markers.
 *
 */
Router::defaultRouteClass(DashedRoute::class);

Router::scope('/', function (RouteBuilder $routes) {

    // Reset & change password
    $routes->connect(
        '/login/reset',
        ['controller' => 'Password', 'action' => 'reset'],
        ['_name' => 'password:reset']
    );
    $routes->connect(
        '/login/change',
        ['controller' => 'Password', 'action' => 'change'],
        ['_name' => 'password:change']
    );

    // Login.
    $routes->connect(
        '/login',
        ['controller' => 'Login', 'action' => 'login'],
        ['_name' => 'login']
    );
    $routes->connect(
        '/logout',
        ['controller' => 'Login', 'action' => 'logout'],
        ['_name' => 'logout']
    );

    // Dashboard.
    $routes->connect(
        '/',
        ['controller' => 'Dashboard', 'action' => 'index'],
        ['_name' => 'dashboard']
    );

    // Profile.
    $routes->connect(
        '/user_profile',
        ['controller' => 'UserProfile', 'action' => 'view'],
        ['_name' => 'user_profile:view']
    );
    $routes->connect(
        '/user_profile/save',
        ['controller' => 'UserProfile', 'action' => 'save'],
        ['_name' => 'user_profile:save']
    );

    // Model.
    Router::prefix('model', ['_namePrefix' => 'model:'], function (RouteBuilder $routes) {

        foreach (['object_types', 'property_types', 'relations', 'categories'] as $controller) {
            // Routes connected here are prefixed with '/model'
            $name = Inflector::camelize($controller);
            $routes->get(
                "/$controller",
                ['controller' => $name, 'action' => 'index'],
                'list:' . $controller
            );

            $routes->get(
                "/$controller/view/:id",
                ['controller' => $name, 'action' => 'view'],
                'view:' . $controller
            )->setPass(['id']);

            $routes->post(
                "/$controller/save",
                ['controller' => $name, 'action' => 'save'],
                'save:' . $controller
            );

            $routes->post(
                "/$controller/remove/:id",
                ['controller' => $name, 'action' => 'remove'],
                'remove:' . $controller
            )->setPass(['id']);
        }
    });

    // Import.
    $routes->connect(
        '/import',
        ['controller' => 'Import', 'action' => 'index'],
        ['_name' => 'import:index']
    );
    $routes->connect(
        '/import/file',
        ['controller' => 'Import', 'action' => 'file', '_method' => 'POST'],
        ['_name' => 'import:file']
    );
    $routes->connect(
        '/import/jobs',
        ['controller' => 'Import', 'action' => 'jobs'],
        ['_name' => 'import:jobs']
    );

    // Trash.
    $routes->connect(
        '/trash',
        ['controller' => 'Trash', 'action' => 'index', '_method' => 'GET'],
        ['_name' => 'trash:list']
    );
    $routes->connect(
        '/trash/view/:id',
        ['controller' => 'Trash', 'action' => 'view'],
        ['pass' => ['id'], '_name' => 'trash:view']
    );
    $routes->connect(
        '/trash/restore',
        ['controller' => 'Trash', 'action' => 'restore'],
        ['_name' => 'trash:restore']
    );
    $routes->connect(
        '/trash/delete',
        ['controller' => 'Trash', 'action' => 'delete'],
        ['_name' => 'trash:delete']
    );
    $routes->connect(
        '/trash/empty',
        ['controller' => 'Trash', 'action' => 'empty'],
        ['_name' => 'trash:empty']
    );

    // view resource by id / uname
    $routes->connect(
        '/view/:id',
        ['controller' => 'Modules', 'action' => 'uname'],
        ['pass' => ['id'], '_name' => 'modules:uname']
    );

    // API proxy
    $routes->scope('/api', ['_namePrefix' => 'api:'], function (RouteBuilder $routes) {
        $routes->get('/**', ['controller' => 'Api', 'action' => 'get'], 'get');
        $routes->post('/**', ['controller' => 'Api', 'action' => 'post'], 'post');
        $routes->patch('/**', ['controller' => 'Api', 'action' => 'patch'], 'patch');
        $routes->delete('/**', ['controller' => 'Api', 'action' => 'delete'], 'delete');
    });

    // Modules.
    $routes->connect(
        '/:object_type',
        ['controller' => 'Modules', 'action' => 'index'],
        ['_name' => 'modules:list']
    );
    $routes->connect(
        '/:object_type/view/new',
        ['controller' => 'Modules', 'action' => 'create'],
        ['_name' => 'modules:create']
    );

    $routes->connect(
        '/:object_type/view/:id',
        ['controller' => 'Modules', 'action' => 'view'],
        ['pass' => ['id'], '_name' => 'modules:view']
    );
    $routes->connect(
        '/:object_type/view/:id/history/:historyId',
        ['controller' => 'History', 'action' => 'restore'],
        ['pass' => ['id', 'historyId'], '_name' => 'history:restore']
    );
    // Translations
    $routes->connect(
        '/:object_type/translation/save',
        ['controller' => 'Translations', 'action' => 'save'],
        ['_name' => 'translations:save']
    );
    $routes->connect(
        '/:object_type/translation/delete',
        ['controller' => 'Translations', 'action' => 'delete'],
        ['_name' => 'translations:delete']
    );
    $routes->connect(
        '/:object_type/translation/:id/add',
        ['controller' => 'Translations', 'action' => 'add'],
        ['pass' => ['id'], '_name' => 'translations:add']
    );
    $routes->connect(
        '/:object_type/translation/:id/:lang',
        ['controller' => 'Translations', 'action' => 'edit'],
        ['pass' => ['id', 'lang'], '_name' => 'translations:edit']
    );
    // Relations ...
    $routes->connect(
        '/:object_type/view/:id/relatedJson/:relation',
        ['controller' => 'Modules', 'action' => 'relatedJson'],
        ['pass' => ['id', 'relation'], '_name' => 'modules:relatedJson']
    );
    $routes->connect(
        '/:object_type/view/:id/relationshipsJson/:relation',
        ['controller' => 'Modules', 'action' => 'relationshipsJson'],
        ['pass' => ['id', 'relation'], '_name' => 'modules:relationshipsJson']
    );
    $routes->connect(
        '/:object_type/view/:id/resourcesJson/:relation',
        ['controller' => 'Modules', 'action' => 'resourcesJson'],
        ['pass' => ['id', 'relation'], '_name' => 'modules:resourcesJson']
    );
    $routes->connect(
        '/:object_type/view/:id/relationData/:relation',
        ['controller' => 'Modules', 'action' => 'relationData'],
        ['pass' => ['id', 'relation'], '_name' => 'modules:relationData']
    );
    $routes->connect(
        '/:object_type/save',
        ['controller' => 'Modules', 'action' => 'save'],
        ['_name' => 'modules:save']
    );
    $routes->connect(
        '/:object_type/saveJson',
        ['controller' => 'Modules', 'action' => 'saveJson'],
        ['_name' => 'modules:saveJson']
    );
    $routes->connect(
        '/:object_type/clone/:id',
        ['controller' => 'Modules', 'action' => 'clone'],
        ['pass' => ['id'], '_name' => 'modules:clone']
    );
    $routes->connect(
        '/:object_type/clone/:id/history/:historyId',
        ['controller' => 'History', 'action' => 'clone'],
        ['pass' => ['id', 'historyId'], '_name' => 'history:clone']
    );
    $routes->connect(
        '/:object_type/history/:id',
        ['controller' => 'History', 'action' => 'info'],
        ['pass' => ['id'], '_name' => 'history:info']
    );
    $routes->connect(
        '/:object_type/delete',
        ['controller' => 'Modules', 'action' => 'delete'],
        ['_name' => 'modules:delete']
    );
    $routes->connect(
        '/:object_type/export',
        ['controller' => 'Export', 'action' => 'export'],
        ['_name' => 'export:export']
    );

    $routes->connect(
        '/:object_type/bulkActions',
        ['controller' => 'Modules', 'action' => 'bulkActions'],
        ['_name' => 'modules:bulkActions']
    );

    // translator service
    $routes->connect(
        '/translate',
        ['controller' => 'Translator', 'action' => 'translate'],
        ['_name' => 'translator:translate']
    );
});
