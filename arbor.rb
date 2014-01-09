require 'compass'
require 'susy'
require 'haml'
require 'sinatra'
require 'sinatra/asset_pipeline'

class Arbor < Sinatra::Base

  register Sinatra::AssetPipeline


  get '/' do
    haml :index
  end

end