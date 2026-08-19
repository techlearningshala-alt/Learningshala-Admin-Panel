"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormActionButtons from "@/components/common/FormActionButtons";
import {
  fetchAllUniversities,
  fetchUniversityCourses,
} from "@/lib/universityApi";
import { createCompareSet, updateCompareSet } from "@/lib/api";
import { notifyError, notifySuccess } from "@/lib/notify";

const emptyPair = () => ({
  university_id: "",
  university_course_id: "",
});

const normalizeList = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
};

export default function AddCompareForm({ item, onCancel, onSuccess }) {
  const [title, setTitle] = useState("");
  const [pairs, setPairs] = useState([emptyPair(), emptyPair()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: universitiesRes, isLoading: loadingUniversities } = useQuery({
    queryKey: ["universities-list-compare"],
    queryFn: fetchAllUniversities,
    staleTime: 5 * 60 * 1000,
  });

  const universities = useMemo(
    () => normalizeList(universitiesRes),
    [universitiesRes]
  );

  useEffect(() => {
    if (!item) {
      setTitle("");
      setPairs([emptyPair(), emptyPair()]);
      return;
    }

    setTitle(item.title || "");
    const loadedPairs = Array.isArray(item.pairs) ? item.pairs : [];
    if (loadedPairs.length >= 2) {
      setPairs(
        loadedPairs.map((p) => ({
          university_id: p.university_id ? String(p.university_id) : "",
          university_course_id: p.university_course_id
            ? String(p.university_course_id)
            : "",
        }))
      );
    } else {
      setPairs([emptyPair(), emptyPair()]);
    }
  }, [item]);

  const updatePair = (index, field, value) => {
    setPairs((prev) =>
      prev.map((pair, i) => {
        if (i !== index) return pair;
        if (field === "university_id") {
          return {
            university_id: value,
            university_course_id: "",
          };
        }
        return { ...pair, [field]: value };
      })
    );
  };

  const addPair = () => {
    setPairs((prev) => [...prev, emptyPair()]);
  };

  const removePair = (index) => {
    if (pairs.length <= 2) return;
    setPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const next = {};
    pairs.forEach((pair, index) => {
      if (!pair.university_id) {
        next[`university_${index}`] = "University is required";
      }
      if (!pair.university_course_id) {
        next[`course_${index}`] = "Course is required";
      }
    });
    if (pairs.length < 2) {
      next.pairs = "At least 2 pairs are required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      title: title.trim() || null,
      pairs: pairs.map((pair) => ({
        university_id: Number(pair.university_id),
        university_course_id: Number(pair.university_course_id),
      })),
    };

    setIsSubmitting(true);
    try {
      if (item?.id) {
        await updateCompareSet(item.id, payload);
        notifySuccess("Compare set updated successfully");
      } else {
        await createCompareSet(payload);
        notifySuccess("Compare set created successfully");
      }
      onSuccess?.();
    } catch (err) {
      notifyError(err?.response?.data?.message || "Failed to save compare set");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 p-6 bg-gray-50 min-h-screen">
      <div className="relative flex justify-center items-center mb-6">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="absolute left-0 hover:bg-gray-200 hover:text-black text-black"
        >
          <ArrowLeft className="mr-2 h-2 w-2" />
          Back to List
        </Button>
        <h3 className="text-2xl font-bold text-blue-700">
          {item?.id ? "Edit Compare" : "Add Compare"}
        </h3>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-2 max-w-xl">
        <Label>Title (optional)</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Top MBA Comparison"
          className="bg-white"
        />
      </div>

      <div className="space-y-4">
        {pairs.map((pair, index) => (
          <ComparePairBlock
            key={`pair-${index}`}
            index={index}
            pair={pair}
            universities={universities}
            loadingUniversities={loadingUniversities}
            errors={errors}
            canRemove={pairs.length > 2}
            onChange={updatePair}
            onRemove={removePair}
          />
        ))}
        {errors.pairs && <p className="text-sm text-red-500">{errors.pairs}</p>}
      </div>

      <div>
        <Button type="button" variant="outline" onClick={addPair}>
          <Plus className="h-4 w-4 mr-2" /> Add more
        </Button>
      </div>
      </div>

      <FormActionButtons
        isEdit={false}
        isSubmitting={isSubmitting}
        isLoading={isSubmitting}
        onSave={handleSave}
        onCancel={onCancel}
        saveButtonText={item?.id ? "Update" : "Save"}
      />
    </div>
  );
}

function ComparePairBlock({
  index,
  pair,
  universities,
  loadingUniversities,
  errors,
  canRemove,
  onChange,
  onRemove,
}) {
  const { data: coursesRes, isLoading: loadingCourses } = useQuery({
    queryKey: ["university-courses-compare", pair.university_id],
    queryFn: () =>
      fetchUniversityCourses({
        page: 1,
        limit: 500,
        university_id: pair.university_id,
      }),
    enabled: Boolean(pair.university_id),
    staleTime: 2 * 60 * 1000,
  });

  const courses = useMemo(() => normalizeList(coursesRes), [coursesRes]);

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-blue-900">Pair {index + 1}</h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>University</Label>
          <select
            className="w-full border rounded-md px-3 py-2 bg-white text-sm"
            value={pair.university_id}
            disabled={loadingUniversities}
            onChange={(e) => onChange(index, "university_id", e.target.value)}
          >
            <option value="">
              {loadingUniversities
                ? "Loading universities..."
                : "Select University"}
            </option>
            {universities.map((uni) => (
              <option key={uni.id} value={String(uni.id)}>
                {uni.university_name || uni.name}
              </option>
            ))}
          </select>
          {errors[`university_${index}`] && (
            <p className="text-xs text-red-500">
              {errors[`university_${index}`]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Course</Label>
          <select
            className="w-full border rounded-md px-3 py-2 bg-white text-sm"
            value={pair.university_course_id}
            disabled={!pair.university_id || loadingCourses}
            onChange={(e) =>
              onChange(index, "university_course_id", e.target.value)
            }
          >
            <option value="">
              {!pair.university_id
                ? "Select university first"
                : loadingCourses
                  ? "Loading courses..."
                  : "Select Course"}
            </option>
            {courses.map((course) => (
              <option key={course.id} value={String(course.id)}>
                {course.name}
              </option>
            ))}
          </select>
          {errors[`course_${index}`] && (
            <p className="text-xs text-red-500">{errors[`course_${index}`]}</p>
          )}
        </div>
      </div>
    </div>
  );
}
