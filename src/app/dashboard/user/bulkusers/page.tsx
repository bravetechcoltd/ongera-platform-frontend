"use client"
import React, { useState, useEffect, ChangeEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  parseExcelFile,
  createBulkUsers,
  getBulkCreationStatus,
  clearError,
  resetBulkCreation
} from '@/lib/features/auth/bulk-users-slice'
import {
  Upload, Users, UserCheck, GraduationCap, 
  FileSpreadsheet, CheckCircle, XCircle, 
  Loader2,  AlertCircle, Edit2,
  Trash2, Plus, Mail,  
  ArrowRight, RefreshCw, FileText
} from 'lucide-react'

interface LocalInstructor {
  email: string
  first_name: string
  last_name: string
  phone_number: string
  department: string
}

interface LocalStudent {
  email: string
  first_name: string
  last_name: string
  phone_number: string
  assigned_instructor_email: string
}

export default function BulkUserCreationForm() {
  const dispatch = useDispatch<AppDispatch>()
  const { parsedData, bulkCreationId, bulkCreationStatus, isLoading, isSubmitting, error } = useSelector((state: RootState) => state.bulkUsers)
  
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState(1)
  const [localInstructors, setLocalInstructors] = useState<LocalInstructor[]>([])
  const [localStudents, setLocalStudents] = useState<LocalStudent[]>([])
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const [manualEntry, setManualEntry] = useState(false)

  useEffect(() => {
    if (parsedData) {
      const instructorsCopy: LocalInstructor[] = (parsedData.instructors || []).map((inst: any) => ({
        email: inst.email || '',
        first_name: inst.first_name || '',
        last_name: inst.last_name || '',
        phone_number: inst.phone_number || '',
        department: inst.department || ''
      }))
      
      const studentsCopy: LocalStudent[] = (parsedData.students || []).map((student: any) => ({
        email: student.email || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        phone_number: student.phone_number || '',
        assigned_instructor_email: student.assigned_instructor_email || ''
      }))
      
      setLocalInstructors(instructorsCopy)
      setLocalStudents(studentsCopy)
    }
  }, [parsedData])

  useEffect(() => {
    if (bulkCreationId && bulkCreationStatus?.status === 'Processing') {
      const interval = setInterval(() => {
        dispatch(getBulkCreationStatus(bulkCreationId))
      }, 3000)
      setStatusCheckInterval(interval)
      return () => clearInterval(interval)
    } else if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      setStatusCheckInterval(null)
    }
  }, [bulkCreationId, bulkCreationStatus?.status, dispatch])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        dispatch(clearError())
      } else {
        alert('Please upload an Excel file (.xlsx or .xls)')
      }
    }
  }

  const handleParseFile = async () => {
    if (!file) return
    setManualEntry(false)
    await dispatch(parseExcelFile(file))
    setStep(2)
  }

  const handleSkipToManualEntry = () => {
    setManualEntry(true)
    setStep(2)
    setLocalInstructors([])
    setLocalStudents([])
  }

  const handleCreateUsers = async () => {
    const invalidInstructors = localInstructors.filter(
      (inst: LocalInstructor) => !inst.email || !inst.first_name || !inst.last_name
    )
    
    if (invalidInstructors.length > 0) {
      alert('Please fill in all required fields for instructors (email, first name, last name)')
      return
    }
    
    // Check for duplicate instructor emails
    const instructorEmails = localInstructors.map(i => i.email.toLowerCase())
    const duplicateInstructorEmails = instructorEmails.filter(
      (email, index) => instructorEmails.indexOf(email) !== index
    )
    
    if (duplicateInstructorEmails.length > 0) {
      alert(`Duplicate instructor emails found: ${duplicateInstructorEmails.join(', ')}`)
      return
    }
    
    // Validate students
    const invalidStudents = localStudents.filter(
      (student: LocalStudent) => !student.email || !student.first_name || !student.last_name || !student.assigned_instructor_email
    )
    
    if (invalidStudents.length > 0) {
      alert('Please fill in all required fields for students (email, first name, last name, assigned instructor)')
      return
    }
    
    // Check for duplicate student emails
    const studentEmails = localStudents.map(s => s.email.toLowerCase())
    const duplicateStudentEmails = studentEmails.filter(
      (email, index) => studentEmails.indexOf(email) !== index
    )
    
    if (duplicateStudentEmails.length > 0) {
      alert(`Duplicate student emails found: ${duplicateStudentEmails.join(', ')}`)
      return
    }
    
    // Validate instructor assignments
    const instructorEmailSet = new Set(instructorEmails)
    const studentsWithInvalidInstructor = localStudents.filter(
      (student: LocalStudent) => !instructorEmailSet.has(student.assigned_instructor_email.toLowerCase())
    )
    
    if (studentsWithInvalidInstructor.length > 0) {
      alert(`${studentsWithInvalidInstructor.length} students are assigned to instructors that don't exist. Please fix the assignments.`)
      return
    }
    
    // All validation passed, proceed with creation
    await dispatch(createBulkUsers({
      instructors: localInstructors,
      students: localStudents
    }))
    setStep(3)
  }

  const handleReset = () => {
    setFile(null)
    setStep(1)
    setLocalInstructors([])
    setLocalStudents([])
    setManualEntry(false)
    dispatch(resetBulkCreation())
  }

  const addInstructor = () => {
    setLocalInstructors([...localInstructors, {
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      department: ''
    }])
  }

  const updateInstructor = (index: number, field: keyof LocalInstructor, value: string) => {
    const updated = localInstructors.map((inst, i) => 
      i === index ? { ...inst, [field]: value } : inst
    )
    setLocalInstructors(updated)
  }

  const removeInstructor = (index: number) => {
    const removedEmail = localInstructors[index].email
    
    // Remove instructor
    const updatedInstructors = localInstructors.filter((_, i) => i !== index)
    setLocalInstructors(updatedInstructors)
    
    // Unassign students from this instructor
    const updatedStudents = localStudents.map(student => 
      student.assigned_instructor_email === removedEmail 
        ? { ...student, assigned_instructor_email: '' }
        : student
    )
    setLocalStudents(updatedStudents)
  }

  const addStudent = () => {
    const availableInstructors = getAvailableInstructors()
    setLocalStudents([...localStudents, {
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      assigned_instructor_email: availableInstructors.length > 0 ? availableInstructors[0].email : ''
    }])
  }

  const updateStudent = (index: number, field: keyof LocalStudent, value: string) => {
    const updated = localStudents.map((student, i) => 
      i === index ? { ...student, [field]: value } : student
    )
    setLocalStudents(updated)
  }

  const removeStudent = (index: number) => {
    setLocalStudents(localStudents.filter((_, i) => i !== index))
  }

  // Helper function to get available instructors for dropdown
  const getAvailableInstructors = () => {
    return localInstructors.filter(inst => inst.email && inst.email.trim() !== '')
  }

  const getProgressPercentage = () => {
    if (!bulkCreationStatus) return 0
    const totalUsers = bulkCreationStatus.total_instructors + bulkCreationStatus.total_students
    const processedUsers = bulkCreationStatus.processed_instructors + bulkCreationStatus.processed_students
    return totalUsers > 0 ? (processedUsers / totalUsers) * 100 : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#0158B7] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Institution Instructors and Students Creation
                </h1>
              </div>
            </div>
            {step > 1 && (
              <button
                onClick={handleReset}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Over
              </button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Upload File', icon: Upload },
              { num: 2, label: 'Review Data', icon: FileText },
              { num: 3, label: 'Create Users', icon: CheckCircle }
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <React.Fragment key={item.num}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= item.num
                        ? 'bg-[#0158B7] text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step > item.num ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      step >= item.num ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-1 mx-4 rounded ${
                      step > item.num ? 'bg-[#0158B7]' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto text-center">
              <FileSpreadsheet className="w-16 h-16 text-[#0158B7] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Choose Your Method
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Upload an Excel file or enter data manually
              </p>

              {/* Option 1: Upload Excel File */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center justify-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Option 1: Upload Excel File
                </h3>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0158B7] transition-colors bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                    {file && (
                      <p className="mt-2 text-sm text-[#0158B7] font-medium">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                  />
                </label>

                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button
                    onClick={handleParseFile}
                    disabled={!file || isLoading}
                    className="flex items-center px-6 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        Parse File
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
                </div>
              </div>

              {/* Option 2: Manual Entry */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 mr-2" />
                  Option 2: Enter Manually
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create instructors and students by filling out the form manually
                </p>
                <button
                  onClick={handleSkipToManualEntry}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium mx-auto"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Start Manual Entry
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review Data */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Mode Indicator */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {manualEntry ? (
                    <>
                      <Edit2 className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Manual Entry Mode</p>
                        <p className="text-xs text-gray-500">Add instructors and students one by one</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-5 h-5 text-[#0158B7]" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Excel Import Mode</p>
                        <p className="text-xs text-gray-500">Review and edit imported data</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-lg font-bold text-[#0158B7]">
                    {localInstructors.length + localStudents.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructors Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-6 h-6 text-[#0158B7]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Instructors ({localInstructors.length})
                  </h2>
                </div>
                <button
                  onClick={addInstructor}
                  className="flex items-center px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Instructor
                </button>
              </div>

              {localInstructors.length === 0 && (
                <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                  <UserCheck className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    No instructors added yet
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    Add at least one instructor to continue
                  </p>
                  <button
                    onClick={addInstructor}
                    className="flex items-center justify-center px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Your First Instructor
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {localInstructors.map((instructor, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={instructor.first_name}
                          onChange={(e) => updateInstructor(index, 'first_name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={instructor.last_name}
                          onChange={(e) => updateInstructor(index, 'last_name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={instructor.email}
                          onChange={(e) => updateInstructor(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={instructor.phone_number || ''}
                          onChange={(e) => updateInstructor(index, 'phone_number', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Department
                        </label>
                        <input
                          type="text"
                          value={instructor.department || ''}
                          onChange={(e) => updateInstructor(index, 'department', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            const studentsCount = localStudents.filter(
                              s => s.assigned_instructor_email === instructor.email
                            ).length
                            
                            if (studentsCount > 0) {
                              const confirmed = window.confirm(
                                `This instructor has ${studentsCount} student(s) assigned. ` +
                                `If you remove this instructor, these students will be unassigned. Continue?`
                              )
                              if (!confirmed) return
                            }
                            
                            removeInstructor(index)
                          }}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-6 h-6 text-[#0158B7]" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Students ({localStudents.length})
                  </h2>
                </div>
                <button
                  onClick={addStudent}
                  disabled={localInstructors.length === 0}
                  className="flex items-center px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title={localInstructors.length === 0 ? 'Add instructors first' : 'Add student'}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Student
                </button>
              </div>

              {localInstructors.length === 0 && (
                <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Add instructors first
                  </p>
                  <p className="text-xs text-gray-600">
                    You need at least one instructor before adding students
                  </p>
                </div>
              )}

              {localStudents.length === 0 && localInstructors.length > 0 && (
                <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                  <GraduationCap className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    No students added yet
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    Add at least one student to continue
                  </p>
                  <button
                    onClick={addStudent}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Your First Student
                  </button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {localStudents.map((student, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={student.first_name}
                          onChange={(e) => updateStudent(index, 'first_name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={student.last_name}
                          onChange={(e) => updateStudent(index, 'last_name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={student.email}
                          onChange={(e) => updateStudent(index, 'email', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={student.phone_number || ''}
                          onChange={(e) => updateStudent(index, 'phone_number', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Assigned Instructor *
                        </label>
                        <select
                          value={student.assigned_instructor_email}
                          onChange={(e) => updateStudent(index, 'assigned_instructor_email', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7]"
                        >
                          <option value="">Select Instructor</option>
                          {getAvailableInstructors().map((inst, i) => (
                            <option key={`${inst.email}-${i}`} value={inst.email}>
                              {inst.first_name && inst.last_name 
                                ? `${inst.first_name} ${inst.last_name} (${inst.email})`
                                : inst.email
                              }
                            </option>
                          ))}
                        </select>
                        {student.assigned_instructor_email && 
                         !getAvailableInstructors().find(i => i.email === student.assigned_instructor_email) && (
                          <p className="text-xs text-red-500 mt-1">
                            ⚠️ Instructor not found in list
                          </p>
                        )}
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeStudent(index)}
                          className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {/* Summary Header */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    Summary
                  </h3>
                  {manualEntry && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Manual Entry
                    </span>
                  )}
                  {!manualEntry && file && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      From Excel: {file.name}
                    </span>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {localInstructors.length + localStudents.length}
                    </p>
                    <p className="text-xs text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#0158B7]">
                      {localInstructors.length}
                    </p>
                    <p className="text-xs text-gray-600">Instructors</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {localStudents.length}
                    </p>
                    <p className="text-xs text-gray-600">Students</p>
                  </div>
                </div>
              </div>

              {/* Detailed Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-[#0158B7]" />
                    Instructors: {localInstructors.length}
                  </p>
                  {localInstructors.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No instructors added</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {localInstructors.map((inst, idx) => (
                        <div key={idx} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                          <span className="font-medium">{idx + 1}.</span> {inst.first_name} {inst.last_name}
                          <span className="text-gray-400 ml-1">({inst.email})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-green-600" />
                    Students Distribution
                  </p>
                  {localStudents.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No students added</p>
                  ) : getAvailableInstructors().length === 0 ? (
                    <p className="text-xs text-red-500">No valid instructors to assign</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {getAvailableInstructors().map((inst) => {
                        const assignedCount = localStudents.filter(
                          s => s.assigned_instructor_email === inst.email
                        ).length
                        return assignedCount > 0 && (
                          <div key={inst.email} className="text-xs text-gray-600 bg-white rounded px-2 py-1">
                            <span className="font-medium">{inst.first_name} {inst.last_name}:</span>
                            <span className="ml-1 text-green-600 font-semibold">
                              {assignedCount} student{assignedCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )
                      })}
                      {localStudents.filter(s => !s.assigned_instructor_email).length > 0 && (
                        <div className="text-xs text-red-500 bg-red-50 rounded px-2 py-1">
                          ⚠️ {localStudents.filter(s => !s.assigned_instructor_email).length} unassigned
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Ready to create {localInstructors.length} instructor{localInstructors.length !== 1 ? 's' : ''} and {localStudents.length} student{localStudents.length !== 1 ? 's' : ''}?
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    Credentials will be sent via email to all users
                  </p>
                </div>
                <button
                  onClick={handleCreateUsers}
                  disabled={isSubmitting || localInstructors.length === 0 || localStudents.length === 0}
                  className="flex items-center px-6 py-3 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Create Users
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Status */}
        {step === 3 && bulkCreationStatus && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                {bulkCreationStatus.status === 'Processing' && (
                  <Loader2 className="w-16 h-16 text-[#0158B7] mx-auto mb-4 animate-spin" />
                )}
                {bulkCreationStatus.status === 'Completed' && (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                )}
                {bulkCreationStatus.status === 'Failed' && (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {bulkCreationStatus.status === 'Processing' && 'Creating Users...'}
                  {bulkCreationStatus.status === 'Completed' && 'All Users Created!'}
                  {bulkCreationStatus.status === 'Failed' && 'Creation Failed'}
                </h2>
                <p className="text-sm text-gray-600">
                  {bulkCreationStatus.status === 'Processing' && 'Please wait while we create accounts and send credentials'}
                  {bulkCreationStatus.status === 'Completed' && 'All credentials have been sent via email'}
                  {bulkCreationStatus.status === 'Failed' && bulkCreationStatus.error_message}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(getProgressPercentage())}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#0158B7] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Instructors</p>
                  <p className="text-2xl font-bold text-[#0158B7]">
                    {bulkCreationStatus.processed_instructors}/{bulkCreationStatus.total_instructors}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Students</p>
                  <p className="text-2xl font-bold text-green-600">
                    {bulkCreationStatus.processed_students}/{bulkCreationStatus.total_students}
                  </p>
                </div>
              </div>

              {bulkCreationStatus.status === 'Completed' && (
                <button
                  onClick={handleReset}
                  className="w-full px-6 py-3 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create More Users
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}