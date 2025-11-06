/**
 * FAQ Custom Renderer
 * Specialized renderer for FAQ section with proper nested structure and button positioning
 */

import { useState, useEffect } from "react";
import { useFieldArray } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CkEditor from "@/components/CKEditor";

export const FAQRenderer = ({ control, register, name, value, watch, setValue }) => {
  const { fields: categories, append: appendCategory, remove: removeCategory } = useFieldArray({
    control,
    name: `${name}.props.faqData`,
  });

  const createEmptyCategory = () => ({
    category: "",
    cat_id: "",
    slug: "",
    items: [{ id: "", question: "", answer: "" }],
    // slug, cat_id will be auto-generated on save
  });

  const createEmptyQuestion = () => ({
    id: "",
    question: "",
    answer: "",
    // id will be auto-generated from question on save
  });

  return (
    <div className="space-y-4">
      {categories.map((category, catIndex) => {
        const categoryPath = `${name}.props.faqData.${catIndex}`;
        
        // ✅ Create a separate component for each category to avoid hooks in loop
        return (
          <FAQCategoryItem
            key={category.id}
            control={control}
            register={register}
            categoryPath={categoryPath}
            category={category}
            watch={watch}
            createEmptyQuestion={createEmptyQuestion}
            removeCategory={removeCategory}
            catIndex={catIndex}
            setValue={setValue}
          />
        );
      })}

      {/* Add More Category Button */}
      {/* <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => appendCategory(createEmptyCategory())}
      >
        + Add More Category
      </Button> */}
    </div>
  );
};

// ✅ Separate component for FAQ Category to avoid hooks in loop
const FAQCategoryItem = ({ control, register, categoryPath, category, watch, createEmptyQuestion, removeCategory, catIndex, setValue }) => {
  const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: `${categoryPath}.items`,
  });

  // Ensure items array is initialized when empty so appendQuestion works
  useEffect(() => {
    if (questions.length === 0) {
      // Ensure the field exists as an empty array
      const fieldPath = `${categoryPath}.items`;
      setValue(fieldPath, [], { shouldValidate: false, shouldDirty: false });
    }
  }, [questions.length, categoryPath, setValue]);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      {/* Category Name */}
      <div className="mb-4">
        <Label>Category Name</Label>
        <Input
          {...register(`${categoryPath}.category`)}
          placeholder="e.g., Admissions, Fees, Courses"
        />
      </div>

      {/* Questions Section */}
      <div className="mb-4">
        <Label className="text-sm font-medium mb-2 block">Questions</Label>
        
        {questions.length === 0 ? (
          <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50 text-center text-gray-500 mb-2">
            No questions yet. Click &quot;Add Question&quot; below to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, qIndex) => {
              const questionPath = `${categoryPath}.items.${qIndex}`;
              
              return (
                <div key={question.id} className="p-3 border rounded bg-white">
                  {/* Question Field */}
                  <div className="mb-3">
                    <Label>Question</Label>
                    <Input
                      {...register(`${questionPath}.question`)}
                      placeholder="Enter question"
                    />
                  </div>

                  {/* Answer Field (CKEditor) */}
                  <div className="mb-3">
                    <Label>Answer</Label>
                    <Controller
                      name={`${questionPath}.answer`}
                      control={control}
                      render={({ field }) => (
                        <CkEditor value={field.value || ""} onChange={field.onChange} />
                      )}
                    />
                  </div>

                  {/* Remove Question Button - Below Answer */}
                  {/* ✅ Allow removing all questions */}
                  <div className="pt-2 border-t flex justify-start">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Remove this question?")) {
                          removeQuestion(qIndex);
                        }
                      }}
                    >
                      Remove Question
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add More Question Button */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              const newQuestion = createEmptyQuestion();
              appendQuestion(newQuestion);
            } catch (error) {
              console.error("Error adding question:", error);
              // Fallback: ensure array exists first
              setValue(`${categoryPath}.items`, [createEmptyQuestion()], { shouldValidate: false });
            }
          }}
        >
          {questions.length === 0 ? "+ Add Question" : "+ Add More Question"}
        </Button>
      </div>

      {/* Remove Category Button - Below "Add More Question" */}
      <div className="pt-3 border-t">
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => {
            // ✅ Confirm removal - removing category will remove all questions inside it
            const questionCount = questions.length;
            const message = questionCount > 0 
              ? `Remove this category and all ${questionCount} question(s) inside it?`
              : "Remove this category?";
            
            if (confirm(message)) {
              // Remove category (which automatically removes all nested questions)
              removeCategory(catIndex);
            }
          }}
        >
          Remove Category {questions.length > 0 && `(${questions.length} questions)`}
        </Button>
      </div>
    </div>
  );
};
