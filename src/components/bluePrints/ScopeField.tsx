"use client";
import React, { useState, useEffect, useRef } from "react";
import { IProject } from "@/@types/interface/project.interface";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ScopeField: React.FC<Props> = ({ value, onChange }) => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<IProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        // Call our server-side proxy that attaches the token and returns project summaries
        const res = await fetch("/api/projects/get-project-ids");
        if (!res.ok) throw new Error("Failed to fetch projects");
        const json = await res.json();
        // External API returns { message, data: [{ _id, title, updatedAt, id }] }
        type ExtProject = { _id?: string; id?: string; title?: string };
        const items = (json.data || []).map((p: ExtProject) => ({
          _id: p._id || p.id || "",
          title: p.title || "",
          description: "",
        })) as IProject[];
        setProjects(items);
        setFilteredProjects(items);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Find selected project by ID when value changes
  useEffect(() => {
    if (value && projects.length > 0) {
      const project = projects.find((p) => p._id === value);
      if (project) {
        setSearchTerm(project.title);
      }
    } else {
      setSearchTerm("");
    }
  }, [value, projects]);

  // Filter projects based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter((project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchTerm, projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setShowDropdown(true);

    // If user clears the input, also clear the selected value
    if (newSearchTerm === "") {
      onChange({
        target: { name: "project_object_id", value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleProjectSelect = (project: IProject) => {
    setSearchTerm(project.title);
    setShowDropdown(false);

    // Update the form value with project ID
    onChange({
      target: { name: "project_object_id", value: project._id || "" },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  return (
    <div className="flex items-start justify-between px-6 py-6 gap-8">
      <div className="flex-1">
        <label className="block font-medium mb-1">Project</label>
        <p className="text-sm text-gray-500">
          Select the project for this blueprint.
        </p>
      </div>
      <div className="flex-1 relative" ref={dropdownRef}>
        <input
          name="project_search"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full px-4 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={
            loading ? "Loading projects..." : "Search project by name..."
          }
          disabled={loading}
          required
        />

        {showDropdown && filteredProjects.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleProjectSelect(project)}
              >
                <div className="font-medium text-gray-900">{project.title}</div>
                <div className="text-sm text-gray-500 truncate">
                  {project.description}
                </div>
                <div className="text-xs text-gray-400">ID: {project._id}</div>
              </div>
            ))}
          </div>
        )}

        {showDropdown &&
          searchTerm &&
          filteredProjects.length === 0 &&
          !loading && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
              No projects found matching &ldquo;{searchTerm}&rdquo;
            </div>
          )}

        {/* Hidden input to maintain form compatibility */}
        <input type="hidden" name="project_object_id" value={value} />
      </div>
    </div>
  );
};

export default ScopeField;
