#!/bin/bash

# Environment setup for CUDA device management
# Tell CUDA to be more cooperative with existing GPU users
export CUDA_MPS_PIPE_DIRECTORY=/tmp/nvidia-mps
export CUDA_MPS_LOG_DIRECTORY=/tmp/nvidia-log
# Set specific GPU device parameters
export NVIDIA_VISIBLE_DEVICES=0
export CUDA_VISIBLE_DEVICES=0

# Configure CUDA to be more lenient with memory management
export CUDA_DEVICE_MAX_CONNECTIONS=1
# Allow shared memory access between processes
export CUDA_IPC_PATH=/dev/shm/cuda.$(id -u)

# Specific Ollama configurations
export OLLAMA_CUDA=1
# Tell Ollama to be more patient during initialization
export OLLAMA_LOAD_TIMEOUT=300s
# Enable detailed logging so we can see what's happening
export OLLAMA_DEBUG=true

# Start Ollama with our custom configuration
exec ollama serve