# Customize this file, and then rename it to config.rb

set :application, "<%= projectName %>"
set :deploy_via, :copy
set :check_revision, false
set :scm, :git

set :repository, File.expand_path("..")


# Using Git Submodules?
set :git_enable_submodules, 1

# Database
# Set the values for host, user, pass, and name for both production and staging.
set :wp do
  {
    :production => {
      :db => {
        :host     => '<%= wpConfig["production.db.host"] %>',
        :user     => '<%= wpConfig["production.db.user"] %>',
        :password => '<%= wpConfig["production.db.password"] %>',
        :name     => '<%= wpConfig["production.db.name"] %>',
      },
      :wp => {
        :host     => '<%= wpConfig["production.host"] %>',
        :table_prefix   => '<%= wpConfig["production.db.prefix"] %>'
      }
    },
    :staging => {
      :db => {
        :host     => '<%= wpConfig["production.db.host"] %>',
        :user     => '<%= wpConfig["production.db.user"] %>',
        :password => '<%= wpConfig["production.db.password"] %>',
        :name     => '<%= wpConfig["production.db.name"] %>',
      },
      :wp => {
        :host     => '<%= wpConfig["production.host"] %>',
        :table_prefix   => '<%= wpConfig["production.db.prefix"] %>'
      }
    },
    :local => {
      :db => {
        :host     => '<%= wpConfig["production.db.host"] %>',
        :user     => '<%= wpConfig["production.db.user"] %>',
        :password => '<%= wpConfig["production.db.password"] %>',
        :name     => '<%= wpConfig["production.db.name"] %>',
      },
      :wp => {
        :host     => '<%= wpConfig["production.host"] %>',
        :table_prefix   => '<%= wpConfig["production.db.prefix"] %>'
      }
    }
  }
end
