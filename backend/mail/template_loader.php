<?php

class TemplateLoader {
    private $templatesPath;

    public function __construct($templatesPath = null) {
        $this->templatesPath = $templatesPath ?: __DIR__;
    }

    /**
     * Load and process an email template
     *
     * @param string $templateName The name of the template file (without .html extension)
     * @param array $data Associative array of data to replace in the template
     * @return string The processed HTML content
     * @throws Exception If template file is not found
     */
    public function loadTemplate($templateName, $data = []) {
        $templateFile = $this->templatesPath . '/' . $templateName . '.html';

        if (!file_exists($templateFile)) {
            throw new Exception("Template file not found: {$templateFile}");
        }

        $template = file_get_contents($templateFile);

        if ($template === false) {
            throw new Exception("Failed to read template file: {$templateFile}");
        }

        return $this->processTemplate($template, $data);
    }

    /**
     * Process template by replacing placeholders with actual data
     *
     * @param string $template The template content
     * @param array $data Associative array of data
     * @return string The processed template
     */
    private function processTemplate($template, $data) {
        // Replace placeholders with actual values
        foreach ($data as $key => $value) {
            $placeholder = '{{' . strtoupper($key) . '}}';
            $template = str_replace($placeholder, $value, $template);
        }

        return $template;
    }

    /**
     * Get available templates
     *
     * @return array List of available template names
     */
    public function getAvailableTemplates() {
        $templates = [];
        $files = glob($this->templatesPath . '/*.html');

        foreach ($files as $file) {
            $templates[] = basename($file, '.html');
        }

        return $templates;
    }
}