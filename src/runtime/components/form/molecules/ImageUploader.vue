<template>
  <v-dialog v-model="dialogOpen" max-width="600" persistent scrollable>
    <template #activator="{ props: activatorProps }">
      <slot name="activator" :props="activatorProps" />
    </template>

    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>{{ $t("upload-image") }}</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          :disabled="isUploading"
          @click="closeDialog"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- File Selection -->
        <div
          v-if="!selectedFile"
          :class="{ 'drag-over': isDragging }"
          class="file-drop-zone"
          @drop.prevent="onDrop"
          @dragover.prevent
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
        >
          <div class="text-center">
            <v-icon size="64" color="primary" class="mb-4">
              mdi-cloud-upload
            </v-icon>
            <div class="text-h6 mb-2">{{ $t("drop-files-here") }}</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ $t("or") }}
            </div>
            <v-btn
              color="primary"
              variant="outlined"
              @click="$refs.fileInput.click()"
            >
              {{ $t("browse-files") }}
            </v-btn>
            <input
              ref="fileInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              style="display: none"
              @change="onFileSelect"
            />
            <div class="text-caption text-medium-emphasis mt-4">
              {{ $t("supported-formats") }}: PNG, JPEG, JPG
            </div>
          </div>
        </div>

        <!-- File Preview and Upload -->
        <div v-else>
          <div class="file-preview mb-4">
            <v-img
              :src="previewUrl"
              :alt="selectedFile.name"
              max-height="300"
              contain
              class="rounded"
            />
            <div class="file-info mt-4">
              <div class="text-subtitle-1 font-weight-medium">
                {{ selectedFile.name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatFileSize(selectedFile.size) }}
              </div>
            </div>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploadStarted">
            <v-progress-linear
              :model-value="uploadProgress"
              :indeterminate="uploadProgress === 0"
              color="primary"
              height="8"
              rounded
              class="mb-2"
            />
            <div class="d-flex justify-space-between align-center mb-4">
              <div class="text-body-2">
                <span v-if="uploadStatus === 'uploading'">
                  {{ $t("uploading") }}: {{ uploadProgress }}%
                </span>
                <span v-else-if="uploadStatus === 'paused'">
                  {{ $t("upload-paused") }}: {{ uploadProgress }}%
                </span>
                <span v-else-if="uploadStatus === 'success'">
                  {{ $t("upload-complete") }}
                </span>
                <span v-else-if="uploadStatus === 'error'" class="error--text">
                  {{ $t("upload-failed") }}
                </span>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatBytes(uploadedBytes) }} /
                {{ formatFileSize(selectedFile.size) }}
              </div>
            </div>

            <!-- Upload Controls -->
            <div class="d-flex gap-2">
              <v-btn
                v-if="uploadStatus === 'uploading'"
                color="warning"
                variant="outlined"
                prepend-icon="mdi-pause"
                @click="pauseUpload"
              >
                {{ $t("pause") }}
              </v-btn>
              <v-btn
                v-else-if="uploadStatus === 'paused'"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-play"
                @click="resumeUpload"
              >
                {{ $t("resume") }}
              </v-btn>
              <v-btn
                v-if="uploadStatus !== 'success'"
                color="error"
                variant="outlined"
                prepend-icon="mdi-close"
                :disabled="uploadStatus === 'uploading'"
                @click="cancelUpload"
              >
                {{ $t("cancel") }}
              </v-btn>
              <v-spacer />
              <v-btn
                v-if="uploadStatus === 'success'"
                color="primary"
                variant="flat"
                prepend-icon="mdi-check"
                @click="confirmUpload"
              >
                {{ $t("done") }}
              </v-btn>
            </div>

            <!-- Error Message -->
            <v-alert
              v-if="errorMessage"
              type="error"
              variant="tonal"
              class="mt-4"
              closable
              @click:close="errorMessage = null"
            >
              {{ errorMessage }}
            </v-alert>
          </div>

          <!-- Initial Upload Button -->
          <div v-else class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-upload"
              :loading="fetchingPresignedUrl"
              @click="startUpload"
            >
              {{ $t("start-upload") }}
            </v-btn>
            <v-btn variant="outlined" @click="clearSelection">
              {{ $t("change-file") }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue"

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:modelValue", "upload-complete"])

// Dialog state
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
})

// File selection state
const selectedFile = ref(null)
const previewUrl = ref(null)
const isDragging = ref(false)

// Upload state
const uploadStarted = ref(false)
const uploadStatus = ref(null) // 'uploading', 'paused', 'success', 'error'
const uploadProgress = ref(0)
const uploadedBytes = ref(0)
const fetchingPresignedUrl = ref(false)
const errorMessage = ref(null)
const isUploading = computed(() => uploadStatus.value === "uploading")

// Upload internals
const presignedUrl = ref(null)
const uploadedFileKey = ref(null)
const abortController = ref(null)
const pausedAt = ref(null)

// File input handling
const onFileSelect = (event) => {
  const file = event.target.files?.[0]
  if (file) {
    handleFileSelection(file)
  }
}

const onDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) {
    handleFileSelection(file)
  }
}

const handleFileSelection = (file) => {
  // Validate file type
  const validTypes = ["image/png", "image/jpeg", "image/jpg"]
  if (!validTypes.includes(file.type)) {
    errorMessage.value = "Invalid file type. Please select a PNG or JPEG image."
    return
  }

  // Validate file size (e.g., 10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = "File is too large. Maximum size is 10MB."
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  errorMessage.value = null
}

const clearSelection = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = null
  uploadStarted.value = false
  uploadStatus.value = null
  uploadProgress.value = 0
  uploadedBytes.value = 0
  errorMessage.value = null
}

// Fetch presigned URL from GraphQL
const fetchPresignedUrl = async () => {
  if (!selectedFile.value) return null

  fetchingPresignedUrl.value = true
  errorMessage.value = null

  try {
    const { $apollo } = useNuxtApp()

    const result = await $apollo.defaultClient.query({
      query: gql`
        query GetPresignedUploadUrl($typeFile: String!) {
          getPresignedUploadUrl(typeFile: $typeFile)
        }
      `,
      variables: {
        typeFile: selectedFile.value.type,
      },
    })

    const url = result.data.getPresignedUploadUrl

    // Extract the S3 key from the presigned URL
    const urlObj = new URL(url)
    const key = urlObj.pathname.substring(1) // Remove leading slash
    uploadedFileKey.value = key

    return url
  } catch (error) {
    console.error("Error fetching presigned URL:", error)
    errorMessage.value = "Failed to get upload URL. Please try again."
    return null
  } finally {
    fetchingPresignedUrl.value = false
  }
}

// Multi-part upload with pause/resume
// const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks for future multi-part upload

const startUpload = async () => {
  if (!selectedFile.value) return

  // Fetch presigned URL
  const url = await fetchPresignedUrl()
  if (!url) return

  presignedUrl.value = url
  uploadStarted.value = true
  uploadStatus.value = "uploading"

  await performUpload()
}

const performUpload = async () => {
  if (!selectedFile.value || !presignedUrl.value) return

  abortController.value = new AbortController()
  uploadStatus.value = "uploading"

  try {
    const file = selectedFile.value
    const totalSize = file.size
    const uploadedSize = pausedAt.value || 0

    // For simplicity, we'll use a single PUT request
    // In a real multi-part upload, you'd split this into chunks
    const fileSlice = file.slice(uploadedSize)

    const response = await fetch(presignedUrl.value, {
      method: "PUT",
      body: fileSlice,
      headers: {
        "Content-Type": file.type,
      },
      signal: abortController.value.signal,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    uploadProgress.value = 100
    uploadedBytes.value = totalSize
    uploadStatus.value = "success"

    // Fetch the uploaded file metadata
    await fetchUploadedFileMetadata()
  } catch (error) {
    if (error.name === "AbortError") {
      uploadStatus.value = "paused"
      pausedAt.value = uploadedBytes.value
    } else {
      console.error("Upload error:", error)
      uploadStatus.value = "error"
      errorMessage.value = error.message || "Upload failed. Please try again."
    }
  }
}

// Note: This is a simplified version. True multi-part upload with pause/resume
// would require the S3 Multipart Upload API, which needs backend support
const pauseUpload = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
  uploadStatus.value = "paused"
  pausedAt.value = uploadedBytes.value
}

const resumeUpload = async () => {
  uploadStatus.value = "uploading"
  await performUpload()
}

const cancelUpload = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
  clearSelection()
}

// Fetch metadata of uploaded file
const fetchUploadedFileMetadata = async () => {
  if (!uploadedFileKey.value) return

  try {
    const { $apollo } = useNuxtApp()

    // Use the listFiles query to get the file metadata
    const graphqlQuery = await import(
      "@paris-ias/trees/dist/graphql/client/files/query.list.files.gql"
    ).then((m) => m.default)

    const result = await $apollo.defaultClient.query({
      query: graphqlQuery,
      variables: {
        options: {
          search: uploadedFileKey.value,
          limit: 1,
          skip: 0,
          sortBy: ["createdAt"],
          sortDesc: [true],
          filters: JSON.stringify({ category: ["IMAGE"] }),
        },
        lang: "en",
      },
      fetchPolicy: "network-only",
    })

    if (result.data.listFiles?.items?.length > 0) {
      const uploadedFile = result.data.listFiles.items[0]
      emit("upload-complete", uploadedFile)
    }
  } catch (error) {
    console.error("Error fetching uploaded file metadata:", error)
  }
}

const confirmUpload = () => {
  closeDialog()
}

const closeDialog = () => {
  if (uploadStatus.value === "uploading") {
    if (!confirm("Upload is in progress. Are you sure you want to close?")) {
      return
    }
    cancelUpload()
  }

  clearSelection()
  dialogOpen.value = false
}

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

const formatBytes = (bytes) => {
  return formatFileSize(bytes)
}

// Cleanup on unmount
watch(dialogOpen, (isOpen) => {
  if (!isOpen) {
    clearSelection()
  }
})
</script>

<style lang="scss" scoped>
.file-drop-zone {
  border: 2px dashed rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 48px 24px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.05);
  }

  &.drag-over {
    border-color: rgb(var(--v-theme-primary));
    background-color: rgba(var(--v-theme-primary), 0.1);
    border-width: 3px;
  }
}

.file-preview {
  .file-info {
    text-align: center;
  }
}
</style>
