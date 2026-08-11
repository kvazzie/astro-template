{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    pnpm = {
      enable = true;
      install.enable = false;
    };
  };

  packages = with pkgs; [
    astro-language-server
    marksman
    prettier
    tailwindcss-language-server
    taplo
    typescript-language-server
    vscode-langservers-extracted
    yaml-language-server
  ];

  git-hooks.hooks = {
    format-check = {
      enable = true;
      name = "format check";
      entry = "pnpm format:check";
      language = "system";
      pass_filenames = false;
      stages = [ "pre-commit" ];
    };

    eslint-check = {
      enable = true;
      name = "eslint check";
      entry = "pnpm lint";
      language = "system";
      pass_filenames = false;
      stages = [ "pre-commit" ];
    };

    stylelint-check = {
      enable = true;
      name = "stylelint check";
      entry = "pnpm stylelint";
      language = "system";
      pass_filenames = false;
      stages = [ "pre-commit" ];
    };

    full-check = {
      enable = true;
      name = "full project check";
      entry = "pnpm check";
      language = "system";
      pass_filenames = false;
      stages = [ "pre-push" ];
    };
  };

  tasks = {
    "app:dev".exec = "pnpm dev";
    "app:build".exec = "pnpm build";
    "app:check".exec = "pnpm check";
    "app:test".exec = "pnpm test";
    "design:generate".exec = "pnpm design:generate";
  };
}
