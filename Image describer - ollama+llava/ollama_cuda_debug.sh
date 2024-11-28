#!/bin/bash

# First, unload any existing CUDA modules/environment
unset CUDA_VISIBLE_DEVICES
unset LD_LIBRARY_PATH

# Set up clean CUDA environment
export CUDA_VISIBLE_DEVICES=0
export LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH
export CUDA_HOME=/usr/local/cuda-12.0

# Force Ollama to use specific CUDA version
export OLLAMA_CUDA=12.0

# Additional debugging
export OLLAMA_DEBUG=true

# Start Ollama with explicit library path
LD_DEBUG=libs ollama serve 2>&1 | tee ollama_cuda_debug.log
