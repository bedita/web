<?php
namespace App\Controller\Component;

use Cake\Cache\Cache;
use Cake\Controller\Component;
use Cake\Core\Configure;

/**
 * ObjectsEditors component
 */
class ObjectsEditorsComponent extends Component
{
    /**
     * Objects editors.
     *
     * @var array
     */
    public $objectsEditors;

    /**
     * Concurrent check time.
     *
     * @var integer
     */
    public $concurrentCheckTime = 20000;

    /**
     * {@inheritDoc}
     */
    public function initialize(array $config): void
    {
        // set concurrent check time by config, if any. default 20s
        $concurrentCheckTime = Configure::read('Editors.concurrentCheckTime');
        if (!empty($concurrentCheckTime)) {
            $this->concurrentCheckTime = $concurrentCheckTime;
        }
        // get concurrent editors
        $this->objectsEditors = $this->getEditors();
        // remove expired data
        $this->cleanup();

        parent::initialize($config);
    }

    /**
     * Update objects editors adding the user access to ID object
     *
     * @param string $id The object ID
     * @return string
     */
    public function update(string $id): string
    {
        if (!array_key_exists($id, $this->objectsEditors)) {
            $this->objectsEditors[$id] = [];
        }
        $found = false;
        $editor = $this->editorName();
        $now = time();
        foreach ($this->objectsEditors[$id] as &$objectEditor) {
            if ($objectEditor['name'] === $editor) {
                $found = true;
                $objectEditor['timestamp'] = $now;
                break;
            }
        }
        if (!$found) {
            $this->objectsEditors[$id][] = [
                'name' => $editor,
                'timestamp' => $now,
            ];
        }
        $encoded = json_encode($this->objectsEditors);
        Cache::write('objects_editors', $encoded);

        return $encoded;
    }

    /**
     * Get editor name from authenticated user.
     *
     * @return string|null
     */
    public function editorName(): ?string
    {
        $user = $this->getController()->Auth->user();
        if (empty($user)) {
            return null;
        }

        if (!empty($user['attributes']['name']) && !empty($user['attributes']['surname'])) {
            return sprintf('%s %s', $user['attributes']['name'], $user['attributes']['surname']);
        }
        if (!empty($user['attributes']['username'])) {
            return $user['attributes']['username'];
        }

        return null;
    }

    /**
     * Get all objects concurrent editors.
     *
     * @return array
     */
    public function getEditors(): array
    {
        $cached = (string)Cache::read('objects_editors', 'default');
        if (empty($cached)) {
            return [];
        }

        return json_decode($cached, true);
    }

    /**
     * Remove expired concurrent editors
     *
     * @return void
     */
    public function cleanup(): void
    {
        if (empty($this->objectsEditors)) {
            return;
        }
        $validity = $this->concurrentCheckTime / 1000;
        $now = time();
        foreach ($this->objectsEditors as $id => $objectEditors) {
            foreach ($objectEditors as $key => $objectEditor) {
                if ($objectEditor['timestamp'] + $validity < $now) {
                    unset($this->objectsEditors[$id][$key]);
                }
            }
        }
        Cache::write('objects_editors', json_encode($this->objectsEditors));
    }
}
