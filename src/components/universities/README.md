# University Form Components - Refactored Structure

## 📁 File Structure

```
src/components/universities/
├── components/
│   ├── DynamicArrayField.js      # Reusable array field with add/remove
│   └── SectionRenderer.js        # Dynamic section rendering logic
├── utils/
│   └── formHelpers.js            # Utility functions for forms
├── AddUniversityForm.js          # Main form component
└── README.md                     # This file
```

---

## 🎯 Purpose

This refactoring separates reusable components and utilities from the main form logic, making the code:
- ✅ **More maintainable** - Smaller, focused files
- ✅ **Reusable** - Components can be used in other forms
- ✅ **Testable** - Each module can be tested independently
- ✅ **Cleaner** - Main form file is now much shorter

---

## 📦 Components

### 1. `components/DynamicArrayField.js`

**Purpose:** Handles dynamic arrays with add/remove functionality

**Props:**
- `control` - React Hook Form control
- `register` - React Hook Form register
- `name` - Field name
- `value` - Array value template
- `renderPropsInputs` - Function to render nested fields
- `sectionPreviews` - Image previews state
- `setSectionPreviews` - Image preview setter
- `fixedSize` - (optional) Boolean to disable add/remove
- `addButtonLabel` - (optional) Custom button label

**Example Usage:**
```javascript
import { DynamicArrayField } from "./components/DynamicArrayField";

<DynamicArrayField
  control={control}
  register={register}
  name="faculties"
  value={[{ name: "", desc: "", img: "" }]}
  renderPropsInputs={renderPropsInputs}
  sectionPreviews={sectionPreviews}
  setSectionPreviews={setSectionPreviews}
  addButtonLabel="Add More Faculty"
/>
```

---

### 2. `components/SectionRenderer.js`

**Exports:**
- `renderPropsInputs()` - Recursive renderer for form fields
- `SectionsForm` - Complete section form component

**Purpose:** Automatically renders form fields based on data structure

**Supported Field Types:**
- ✅ Text inputs
- ✅ Textareas (for `desc`, `description`, `reviewContent`)
- ✅ Image uploads (with preview)
- ✅ CKEditor (for `content`, `answer`)
- ✅ Dynamic arrays (with add/remove)
- ✅ Nested objects (recursive)

**Example Usage:**
```javascript
import { SectionsForm } from "./components/SectionRenderer";

<SectionsForm
  sections={watch("sections") || []}
  control={control}
  register={register}
  sectionPreviews={sectionPreviews}
  setSectionPreviews={setSectionPreviews}
  watch={watch}
/>
```

---

## 🛠️ Utilities

### `utils/formHelpers.js`

**Exported Functions:**

#### `deepMergeProps(oldObj, newObj)`
Deep merges two objects, prioritizing new values
```javascript
const merged = deepMergeProps(defaultProps, dbProps);
```

#### `getAddButtonLabel(fieldKey)`
Returns appropriate button label for array fields
```javascript
getAddButtonLabel("faqData")  // → "Add More Category"
getAddButtonLabel("items")     // → "Add More Question"
```

#### `createEmptyStructure(obj)`
Creates empty structure from template (for new array items)
```javascript
const empty = createEmptyStructure({ name: "", desc: "" });
// → { name: "", desc: "" }
```

#### `shouldSkipField(key)`
Checks if field should be skipped from rendering
```javascript
shouldSkipField("bgColor")  // → true
```

#### `isTextareaField(key)`
Checks if field should render as textarea
```javascript
isTextareaField("desc")  // → true
```

#### `isImageField(key)`
Checks if field is an image/file upload
```javascript
isImageField("logo")  // → true
```

#### `isCKEditorField(key)`
Checks if field should use CKEditor
```javascript
isCKEditorField("content")  // → true
```

#### `buildPreviewURL(value, sectionPreviews, fieldName)`
Builds preview URL for images
```javascript
const url = buildPreviewURL(value, sectionPreviews, "sections.0.props.logo");
```

---

## 🚀 How to Use in Other Forms

### Example: Creating a Mentor Form

```javascript
import { useForm } from "react-hook-form";
import { SectionsForm, renderPropsInputs } from "@/components/universities/components/SectionRenderer";
import { DynamicArrayField } from "@/components/universities/components/DynamicArrayField";
import { deepMergeProps, getAddButtonLabel } from "@/components/universities/utils/formHelpers";

export default function AddMentorForm({ item, onCancel }) {
  const { control, register, watch } = useForm();
  const [sectionPreviews, setSectionPreviews] = useState({});

  // Define your sections
  const defaultSections = [
    {
      id: "mentor-bio",
      title: "Mentor Bio",
      component: "MentorBio",
      props: {
        content: "",
        image: "",
      },
    },
    {
      id: "mentor-skills",
      title: "Skills",
      component: "MentorSkills",
      props: {
        skills: [{ name: "", level: "" }],
      },
    },
  ];

  return (
    <form>
      <SectionsForm
        sections={defaultSections}
        control={control}
        register={register}
        sectionPreviews={sectionPreviews}
        setSectionPreviews={setSectionPreviews}
        watch={watch}
      />
    </form>
  );
}
```

---

## 📋 Field Type Detection

The `renderPropsInputs` function automatically detects field types:

| Field Name Pattern | Rendered As | Examples |
|-------------------|-------------|----------|
| `desc`, `description`, `reviewContent` | Textarea | `desc`, `description` |
| `content`, `answer` | CKEditor | `content`, `answer` |
| Contains `img`, `logo`, `image`, `sample` | File Upload | `logo`, `sampleImg` |
| Array type | DynamicArrayField | `items[]`, `faculties[]` |
| Object type | Nested fields | `gridContent` |
| Other | Text input | `name`, `title` |

---

## 🎨 Add Button Labels

Context-aware labels for "Add More" buttons:

| Field Key | Button Label |
|-----------|-------------|
| `faqData` | Add More Category |
| `items` | Add More Question |
| `faculties` | Add More Faculty |
| `emiPartners` | Add More EMI Partner |
| `allReviews` | Add More Review |
| `gridContent` | Add More Grid Item |
| `banners` | Add More Banner |
| Others | Add More |

---

## 🔧 Customization

### To add new field types:

Edit `utils/formHelpers.js`:
```javascript
export const isCustomField = (key) => {
  return key === "myCustomField";
};
```

Edit `components/SectionRenderer.js`:
```javascript
if (isCustomField(key)) {
  return <MyCustomInput {...register(fieldName)} />;
}
```

### To add new button labels:

Edit `utils/formHelpers.js`:
```javascript
const labelMap = {
  // ... existing labels ...
  myField: "Add More Item",
};
```

---

## 📊 Benefits

**Before Refactoring:**
- Single file: ~1000+ lines
- Hard to maintain
- Code duplication risk

**After Refactoring:**
- Main form: ~700 lines
- Utils: ~120 lines
- Components: ~170 lines
- **Reusable across all CMS forms**

---

## 💡 Tips

1. **Consistent Data Structure:** Keep your section props consistent with the default sections
2. **Image Previews:** Always use the `sectionPreviews` state for image uploads
3. **Deep Merge:** Use `deepMergeProps` when editing to preserve both old and new fields
4. **Custom Labels:** Add field-specific labels to `getAddButtonLabel()` for better UX

---

## 🐛 Troubleshooting

**Issue:** Fields not showing
- ✅ Check `shouldSkipField()` - your field might be in the skip list

**Issue:** Images not previewing
- ✅ Ensure `sectionPreviews` state is passed correctly
- ✅ Check `buildPreviewURL()` is being used

**Issue:** Wrong input type
- ✅ Check field name patterns in helper functions
- ✅ Verify field detection logic in `renderPropsInputs`

---

## 📝 License

Internal use for CMS Admin project

