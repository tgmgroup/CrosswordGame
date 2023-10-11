#!/usr/bin/perl
# Check all strings in code and HTML are reflected in en.json and translations
use strict;
use utf8;
use Path::Tiny;
use JSON;

die "Must be run from the root directory\n" unless -d "html";

binmode(STDOUT, ":utf8");
binmode(STDERR, ":utf8");

my %found;

# LOAD HTML
# Attributes scanned:
# data-i18n=
# data-i18n-placeholder=
# data-i18n-tooltip=
my $htmld;
opendir($htmld, "html");
foreach my $html (grep { /\.html$/ } readdir($htmld)) {
	my $data = path("html/$html")->slurp();
	while ($data =~ /data-i18n(?:|-placeholder|-tooltip)=(["'])(.*?)\1/g) {
		push(@{$found{$2}}, $html);
	}
}
closedir($htmld);

# LOAD JS
# Scan calls to .i18n(, grab $1
# Scan /*i18n*/ before a string, grab the string
# Scan /*i18n prefix*/ before a string, grab prefixthestring e.g.
# /*i18n ui-$/'frood' will grab 'ui-frood'
foreach my $dir ("js/browser", "js/game", "js/server") {
	my $jsd;
	opendir($jsd, $dir);
	foreach my $js (grep { /\.js$/ } readdir($jsd)) {
		my $data = path("$dir/$js")->slurp();
		$data =~ s/[\r\n]+/ /g;
		while ($data =~ /\.i18n\s*\(\s*(["'])(.*?)\1/g) {
			push(@{$found{$2}}, $js);
		}
		while ($data =~ /\/\*i18n(?: ([-\w]*?))?\*\/\s*(["'])(.*?)\2/g) {
			my $key = ($1 || '') . $3;
			push(@{$found{$key}}, $js);
		}
	}
	closedir($jsd);
}

# LOAD STRINGS
# from i18n*.json
my $i18nd;
my %strings;
opendir($i18nd, "i18n");
foreach my $json (grep { /\.json$/ } readdir($i18nd)) {
	my $data = decode_json path("i18n/$json")->slurp();
	delete $data->{'@metadata'};
	$json =~ /^(.*)\.json/;
	my $lang = $1;
	$strings{$1} = $data;
}

my $warns = 0;

foreach my $string ( sort keys %found ) {
	if (!$strings{"en"}{$string}) {
		#print "Assuming '$string' is OK\n";
		$strings{"en"}{$string} = $string;
	}
}

# CHECK STRINGS IN en.json OCCUR AT LEAST ONCE IN HTML/JS
foreach my $string ( sort keys %{$strings{"en"}}) {
	if (!$found{$string}) {
		print STDERR "'$string' was found in en.json, but is not used in code\n";
		$warns++;
	}
}

# CHECK OTHER LANGUAGES
# Check that all keys in en are also in other languages.
# Check that all keys in other languages occur in en
foreach my $lang (keys %strings) {
	next if ($lang eq "en");
	print "-------------- THE FOLLOWING $lang STRINGS WILL USE ENGLISH\n";
	my @ens = ();
	foreach my $key (keys %{$strings{en}}) {
		next if ($strings{$lang}{$key});
		print STDERR "\"$strings{en}{$key}\",\n";
		push(@ens, $key);
		$warns++;
	}

	foreach my $key (keys %{$strings{$lang}}) {
		next if ($strings{"en"}{$key});
		print STDERR "\"$key\" is in ${lang} but not in en\n";
		$warns++;
	}
	if (scalar(@ens) > 0) {
		print STDERR "### Corresponding English strings:\n";
		print STDERR join("\n", map { "\"$_\"" } @ens),"\n";
	}
}


if ($warns > 0) {
	print STDERR "$warns warnings\n";
}
