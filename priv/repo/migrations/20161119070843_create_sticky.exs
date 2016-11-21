defmodule FlaskOnPhoenix.Repo.Migrations.CreateSticky do
  use Ecto.Migration

  def change do
    create table(:stickys) do
      add :color, :string
      add :text, :text
      add :left, :integer
      add :top, :integer
      add :width, :integer
      add :height, :integer
      add :scaleX, :integer
      add :scaleY, :integer
      add :angle, :integer
      add :group_left, :integer
      add :group_top, :integer
      add :group_width, :integer
      add :group_height, :integer
      add :group_scaleX, :integer
      add :group_scaleY, :integer
      add :group_angle, :integer

      timestamps()
    end

  end
end
