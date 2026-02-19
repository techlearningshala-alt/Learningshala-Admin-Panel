"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import FormActionButtons from "@/components/common/FormActionButtons";

const defaultFormValues = {
  name: "",
  email: "",
  password: "",
  role: "mentor",
  can_create: false,
  can_read: true,
  can_update: false,
  can_delete: false,
};

export default function CreateUserForm({ item, onCancel, onSuccess }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (item) {
      // Set form values from item
      setValue("name", item.name || "");
      setValue("email", item.email || "");
      setValue("role", item.role || "mentor");
      setValue("can_create", item.can_create || false);
      setValue("can_read", item.can_read !== undefined ? item.can_read : true);
      setValue("can_update", item.can_update || false);
      setValue("can_delete", item.can_delete || false);
      // Don't set password for edit mode
    } else {
      reset(defaultFormValues);
    }
  }, [item, setValue, reset]);

  const mutation = useMutation({
    mutationFn: ({ data, saveWithDate }) => {
      if (item?.id) {
        // Update user - don't send password if it's empty
        const updateData = { ...data, saveWithDate };
        if (!updateData.password || updateData.password.trim() === "") {
          delete updateData.password;
        }
        return updateUser(item.id, updateData);
      } else {
        return createUser(data);
      }
    },
    onSuccess: () => {
      notifySuccess(item ? "User updated successfully" : "User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      notifyError(error?.response?.data?.message || (item ? "Failed to update user" : "Failed to create user"));
    },
  });

  const onSubmit = (data, saveWithDate = true) => {
    mutation.mutate({ data, saveWithDate });
  };

  const role = watch("role");

  return (
    <div className="p-6 bg-gray-50 min-h-screen pb-24">
      <div className="relative flex justify-center items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="absolute left-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <h3 className="text-2xl text-blue-700 font-bold">{item ? "Edit User" : "Create User"}</h3>
      </div>

      <form className="space-y-6 max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Name is required" })}
              placeholder="Enter user name"
              className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Enter email address"
              className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password {!item && <span className="text-red-500">*</span>}
              {item && <span className="text-gray-500 text-sm">(Leave empty to keep current password)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password", {
                required: !item ? "Password is required" : false,
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                validate: (value) => {
                  if (item && value && value.length < 6) {
                    return "Password must be at least 6 characters";
                  }
                  return true;
                },
              })}
              placeholder={item ? "Enter new password (optional)" : "Enter password (min 6 characters)"}
              className="focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role <span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              className="w-full border rounded px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              {...register("role", { required: "Role is required" })}
            >
              <option value="mentor">User</option>
              <option value="admin">Admin</option>
              {/* <option value="lead">Lead</option> */}
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          {(role === "mentor" || (item && item.role === "mentor")) && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <Label className="text-sm font-medium text-gray-700">CRUD Permissions</Label>
              <p className="text-sm text-gray-600">
                Select which permissions this user should have:
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_create"
                    {...register("can_create")}
                  />
                  <Label htmlFor="can_create" className="font-normal cursor-pointer">
                    Create - Allow creating new resources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_read"
                    {...register("can_read")}
                  />
                  <Label htmlFor="can_read" className="font-normal cursor-pointer">
                    Read - Allow viewing resources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_update"
                    {...register("can_update")}
                  />
                  <Label htmlFor="can_update" className="font-normal cursor-pointer">
                    Update - Allow editing resources
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="can_delete"
                    {...register("can_delete")}
                  />
                  <Label htmlFor="can_delete" className="font-normal cursor-pointer">
                    Delete - Allow deleting resources
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      <FormActionButtons
        isEdit={!!item}
        isSubmitting={isSubmitting}
        isLoading={mutation.isLoading}
        onSave={(saveWithDate) => handleSubmit((data) => onSubmit(data, saveWithDate))()}
        onCancel={onCancel}
        saveButtonText={item ? "Update User" : "Create User"}
      />
    </div>
  );
}

