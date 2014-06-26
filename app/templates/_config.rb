# Customize this file, and then rename it to config.rb

set :application, "<%= answers.project %>"
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
        :host     => '<%= answers["production.db.host"] %>',
        :user     => '<%= answers["production.db.user"] %>',
        :password => '<%= answers["production.db.password"] %>',
        :name     => '<%= answers["production.db.name"] %>',
      },
      :wp => {
        :host     => '<%= answers["production.host"] %>',
        :table_prefix   => '<%= answers["production.db.prefix"] %>'
      }
    },
    :staging => {
      :db => {
        :host     => '<%= answers["production.db.host"] %>',
        :user     => '<%= answers["production.db.user"] %>',
        :password => '<%= answers["production.db.password"] %>',
        :name     => '<%= answers["production.db.name"] %>',
      },
      :wp => {
        :host     => '<%= answers["production.host"] %>',
        :table_prefix   => '<%= answers["production.db.prefix"] %>'
      }
    },
    :local => {
      :db => {
        :host     => '<%= answers["production.db.host"] %>',
        :user     => '<%= answers["production.db.user"] %>',
        :password => '<%= answers["production.db.password"] %>',
        :name     => '<%= answers["production.db.name"] %>',
      },
      :wp => {
        :host     => '<%= answers["production.host"] %>',
        :table_prefix   => '<%= answers["production.db.prefix"] %>'
      }
    }
  }
end
