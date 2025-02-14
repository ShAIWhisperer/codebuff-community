#!/usr/bin/expect -f

# Version 1.0.1 - Testing build update
# Log to stderr
proc log {msg} {
    puts stderr "\[WRAPPER\] \[$msg\]"
}

proc debug {msg} {
    puts stderr "\[WRAPPER DEBUG\] \[$msg\]"
}

proc strip_ansi {text} {
    # Strip ANSI escape sequences
    regsub -all {\x1b\[[0-9;]*[mGJK]} $text {} text
    return $text
}

proc write_response {line} {
    if {![info exists ::env(PROJECT_PATH)]} {
        log "ERROR: PROJECT_PATH environment variable not set"
        exit 1
    }

    set project_path $::env(PROJECT_PATH)
    set comm_dir "/workspace/$project_path/.codebuff/comm"
    debug "Writing response to $comm_dir/responses.txt: $line"
    if [catch {
        set f [open "$comm_dir/responses.txt" "a"]
        puts $f $line
        close $f
        debug "Successfully wrote response"
    } err] {
        log "Error writing response: $err"
    }
}

log "Starting codebuff wrapper..."

# Verify required environment variables
if {![info exists ::env(PROJECT_PATH)]} {
    log "ERROR: PROJECT_PATH environment variable not set"
    exit 1
}
if {![info exists ::env(PROJECT_NAME)]} {
    log "ERROR: PROJECT_NAME environment variable not set"
    exit 1
}

set project_name $::env(PROJECT_NAME)
set project_path $::env(PROJECT_PATH)
debug "Project name: $project_name"
debug "Project path: $project_path"
debug "Comm dir: /workspace/$project_path/.codebuff/comm"

# Always enable debugging
exp_internal 1
log_user 1

# Signal ready before starting codebuff
write_response "CONTAINER READY"

# Start codebuff
spawn codebuff
debug "Spawned codebuff process"

# Monitor messages.txt and send input
set timeout -1
while {1} {
    set messages_file "/workspace/$project_path/.codebuff/comm/messages.txt"
    debug "Checking messages file: $messages_file"

    if {[file exists $messages_file]} {
        debug "Found messages.txt file"
        # Wait for a modification event
        debug "Running inotifywait on $messages_file"
        set result [catch {exec inotifywait -q -e modify $messages_file} err]
        if {$result != 0} {
            debug "inotifywait error: $err"
            sleep 0.1
            continue
        }
        debug "Got inotifywait event"

        if [catch {
            set f [open $messages_file r]
            set message [read $f]
            close $f
            debug "Read message content: '$message'"

            if {$message != ""} {
                debug "Sending message to codebuff"
                send "$message"
                sleep 1
                send "\r"
                debug "Message sent"

                # Clear the message file after sending
                debug "Clearing message file..."
                if [catch {
                    set f [open $messages_file w]
                    close $f
                    debug "Message file cleared"
                } err] {
                    log "Error clearing message file: $err"
                }
            } else {
                debug "Message was empty"
            }
        } err] {
            log "Error processing message: $err"
        }
    } else {
        debug "Messages file does not exist"
    }

    # Check for output from codebuff
    expect {
        -re "(.+)\r\n" {
            debug "Got output: $expect_out(1,string)"
            write_response $expect_out(1,string)
            exp_continue
        }
        "$project_name > " {
            debug "Got prompt"
            write_response "$project_name > "
        }
        timeout {
            # No output, continue checking messages
        }
    }

    sleep 0.1
}
