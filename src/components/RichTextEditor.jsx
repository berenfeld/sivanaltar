import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useLang } from "@/lib/LanguageContext";
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/models/dom";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/wordcount";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/emoticons/js/emojis";

export default function RichTextEditor({ value, onChange, height = 450 }) {
  const editorRef = useRef(null);
  const { lang, dir } = useLang();
  const isHe = lang === 'he';

  return (
    <Editor
      tinymceScriptSrc={undefined}
      licenseKey="gpl"
      onInit={(evt, editor) => { editorRef.current = editor; }}
      value={value}
      onEditorChange={(content) => onChange(content)}
      init={{
        height,
        menubar: false,
        directionality: isHe ? "rtl" : "ltr",
        ...(isHe ? { language: "he_IL" } : {}),
        plugins: [
          "advlist", "autolink", "lists", "link", "image",
          "charmap", "searchreplace", "wordcount", "code",
          "table", "emoticons"
        ],
        toolbar:
          "undo redo | styles | bold italic underline strikethrough | " +
          "alignright aligncenter alignleft alignjustify | " +
          "bullist numlist | outdent indent | " +
          "link image table | emoticons charmap | " +
          "removeformat code",
        toolbar_mode: "wrap",
        content_style: `
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 15px;
            direction: ${dir};
            text-align: ${isHe ? 'right' : 'left'};
            color: #3a3a4a;
            line-height: 1.7;
            padding: 12px 16px;
          }
          p { margin: 0 0 10px 0; }
          h2 { color: #4a8fa0; }
          h3 { color: #4a8fa0; }
          ul, ol { padding-${isHe ? 'right' : 'left'}: 1.5rem; }
          a { color: #4a8fa0; }
        `,
        branding: false,
        promotion: false,
        skin: false,
        content_css: false,
      }}
    />
  );
}
