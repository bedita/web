<?php
namespace App\Test\TestCase\Controller\Component;

use App\Controller\Component\ObjectsEditorsComponent;
use Cake\Cache\Cache;
use Cake\Controller\Component\AuthComponent;
use Cake\Controller\Controller;
use Cake\Core\Configure;
use Cake\TestSuite\TestCase;

/**
 * {@see \App\Controller\Component\ObjectsEditorsComponent} Test Case
 *
 * @coversDefaultClass \App\Controller\Component\ObjectsEditorsComponent
 */
class ObjectsEditorsComponentTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Controller\Component\ObjectsEditorsComponent
     */
    public $ObjectsEditors;

    /**
     * {@inheritDoc}
     */
    public function setUp(): void
    {
        Cache::enable();
        parent::setUp();
        $controller = new Controller();
        $registry = $controller->components();
        $registry->load('Auth');
        $this->ObjectsEditors = $registry->load(ObjectsEditorsComponent::class);
        $this->Auth = $registry->load(AuthComponent::class);
        $controller->Auth = $this->Auth;
    }

    /**
     * {@inheritDoc}
     */
    public function tearDown(): void
    {
        unset($this->ObjectsEditors);
        Cache::disable();

        parent::tearDown();
    }

    /**
     * Test initial setup
     *
     * @return void
     * @covers ::initialize()
     */
    public function testInitialize(): void
    {
        // verify concurrent check time is not empty
        $this->ObjectsEditors->initialize([]);
        static::assertNotEmpty($this->ObjectsEditors->concurrentCheckTime);

        // verify concurrent check time is read from config
        $expected = 15000;
        Configure::write('Editors.concurrentCheckTime', 15000); // 15 seconds
        $this->ObjectsEditors->initialize([]);
        $actual = $this->ObjectsEditors->concurrentCheckTime;
        static::assertEquals($expected, $actual);

        // verify objectsEditors is an array
        $expected = true;
        $actual = is_array($this->ObjectsEditors->objectsEditors);
        static::assertEquals($expected, $actual);
    }

    /**
     * Test `update` method
     *
     * @return void
     * @covers ::update()
     */
    public function testUpdate(): void
    {
        $time = time();
        $this->ObjectsEditors->objectsEditors = [
            '99999' => [
                ['name' => 'gustavo', 'timestamp' => $time],
                ['name' => 'john doe', 'timestamp' => $time],
                ['name' => 'jane doe', 'timestamp' => $time],
            ],
        ];

        // id not found in objectsEditors
        $user = ['id' => 123, 'attributes' => ['name' => 'Gustavo', 'surname' => 'Support']];
        $this->ObjectsEditors->getController()->Auth->setUser($user);
        $this->ObjectsEditors->update('999');
        $expected = 'Gustavo Support';
        $actual = $this->ObjectsEditors->objectsEditors['999'][0]['name'];
        static::assertEquals($expected, $actual);
        $expected = [
            ['name' => 'gustavo', 'timestamp' => $time],
            ['name' => 'john doe', 'timestamp' => $time],
            ['name' => 'jane doe', 'timestamp' => $time],
        ];
        $actual = $this->ObjectsEditors->objectsEditors['99999'];
        static::assertEquals($expected, $actual);

        // id found in objectsEditors
        $user = ['id' => 12345, 'attributes' => ['name' => 'john', 'surname' => 'doe']];
        $this->ObjectsEditors->getController()->Auth->setUser($user);
        $this->ObjectsEditors->update('99999');
        $expected = 'gustavo';
        $actual = $this->ObjectsEditors->objectsEditors['99999'][0]['name'];
        static::assertEquals($expected, $actual);
        $expected = 'john doe';
        $actual = $this->ObjectsEditors->objectsEditors['99999'][1]['name'];
        static::assertEquals($expected, $actual);
    }

    /**
     * Test `editorName` method
     *
     * @return void
     * @covers ::editorName()
     */
    public function testEditorName(): void
    {
        // empty user
        $expected = null;
        $actual = $this->ObjectsEditors->editorName();
        static::assertEquals($expected, $actual);

        // no username, no name, no surname
        $user = ['id' => 123];
        $this->ObjectsEditors->getController()->Auth->setUser($user);
        $expected = null;
        $actual = $this->ObjectsEditors->editorName();
        static::assertEquals($expected, $actual);

        // username
        $user = ['id' => 123, 'attributes' => ['username' => 'gustavo']];
        $this->ObjectsEditors->getController()->Auth->setUser($user);
        $expected = 'gustavo';
        $actual = $this->ObjectsEditors->editorName();
        static::assertEquals($expected, $actual);

        // name + surname
        $user = ['id' => 123, 'attributes' => ['name' => 'Gustavo', 'surname' => 'Support']];
        $this->ObjectsEditors->getController()->Auth->setUser($user);
        $expected = 'Gustavo Support';
        $actual = $this->ObjectsEditors->editorName();
        static::assertEquals($expected, $actual);
    }

    /**
     * Test `getEditors` method
     *
     * @return void
     * @covers ::getEditors()
     */
    public function testGetEditors(): void
    {
        // empty cache
        Cache::delete('objects_editors');
        $expected = [];
        $actual = $this->ObjectsEditors->getEditors();
        static::assertEquals($expected, $actual);

        // not empty cache
        $user = ['id' => 123, 'attributes' => ['username' => 'gustavo']];
        $this->ObjectsEditors->getController()->Auth->setUser($user);
        $expected = $this->ObjectsEditors->update(999);
        $expected = json_decode($expected, true);
        $actual = $this->ObjectsEditors->getEditors();
        static::assertEquals($expected, $actual);
    }

    /**
     * Test `cleanup` method
     *
     * @return void
     * @covers ::cleanup()
     */
    public function testCleanup(): void
    {
        // empty object editors
        $expected = [];
        $this->ObjectsEditors->objectsEditors = $expected;
        $this->ObjectsEditors->cleanup();
        static::assertEquals($expected, $this->ObjectsEditors->objectsEditors);

        // not empty, remove expired
        $validity = $this->ObjectsEditors->concurrentCheckTime / 1000;
        $time = time();
        $this->ObjectsEditors->objectsEditors = [
            '99999' => [
                ['name' => 'gustavo', 'timestamp' => $time], // valid
                ['name' => 'john doe', 'timestamp' => $time - $validity - 1], // expired
            ],
        ];
        $this->ObjectsEditors->cleanup();
        $expected = [
            '99999' => [
                ['name' => 'gustavo', 'timestamp' => $time], // valid
            ],
        ];
        static::assertEquals($expected, $this->ObjectsEditors->objectsEditors);
    }
}
