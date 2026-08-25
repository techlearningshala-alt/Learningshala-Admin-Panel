"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [description, setDescription] = useState("");
  const [universityUrl, setUniversityUrl] = useState("");
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
      setDescription("");
      setUniversityUrl("");
      setPairs([emptyPair(), emptyPair()]);
      return;
    }

    setTitle(item.title || "");
    setDescription(item.description || "");
    setUniversityUrl(item.university_url || "");
    const loadedPairs = Array.isArray(item.pairs) ? item.pairs : [];
    setPairs([
      {
        university_id: loadedPairs[0]?.university_id
          ? String(loadedPairs[0].university_id)
          : "",
        university_course_id: loadedPairs[0]?.university_course_id
          ? String(loadedPairs[0].university_course_id)
          : "",
      },
      {
        university_id: loadedPairs[1]?.university_id
          ? String(loadedPairs[1].university_id)
          : "",
        university_course_id: loadedPairs[1]?.university_course_id
          ? String(loadedPairs[1].university_course_id)
          : "",
      },
    ]);
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
    if (pairs.length !== 2) {
      next.pairs = "Exactly 2 universities are required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const payload = {
      title: title.trim() || null,
      description: description.trim() || null,
      university_url: universityUrl.trim() || null,
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
        <div className="space-y-2">
          <Label>Title (optional)</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Top MBA Comparison"
            className="bg-white w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            rows={4}
            className="bg-white w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>University URL</Label>
          <Input
            value={universityUrl}
            onChange={(e) => setUniversityUrl(e.target.value)}
            placeholder="https://..."
            className="bg-white w-full"
          />
        </div>

        <div className="space-y-4">
          {pairs.map((pair, index) => (
            <ComparePairBlock
              key={`university-${index}`}
              index={index}
              pair={pair}
              universities={universities}
              loadingUniversities={loadingUniversities}
              errors={errors}
              onChange={updatePair}
            />
          ))}
          {errors.pairs && <p className="text-sm text-red-500">{errors.pairs}</p>}
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
  onChange,
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
      <h3 className="font-semibold text-blue-900">University {index + 1}</h3>

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
